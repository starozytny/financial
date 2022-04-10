<?php

namespace App\Controller\Api\Budget;

use App\Entity\Budget\BuCategory;
use App\Entity\Budget\BuItem;
use App\Entity\Budget\BuTotal;
use App\Entity\User;
use App\Service\ApiResponse;
use App\Service\Data\Budget\DataCategory;
use App\Service\Data\Budget\DataItem;
use App\Service\Data\DataService;
use App\Service\ValidatorService;
use Doctrine\Common\Persistence\ManagerRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use OpenApi\Annotations as OA;
use Symfony\Component\Serializer\SerializerInterface;

/**
 * @Route("/api/budget/categories", name="api_budget_categories_")
 */
class CategoryController extends AbstractController
{
    private $doctrine;

    public function __construct(ManagerRegistry $doctrine)
    {
        $this->doctrine = $doctrine;
    }

    public function submitForm($type, BuCategory $obj, Request $request, ApiResponse $apiResponse,
                               ValidatorService $validator, DataCategory $dataEntity): JsonResponse
    {
        $em = $this->doctrine->getManager();
        $data = json_decode($request->getContent());


        $oldTotal = $obj->getTotal();
        $oldUsed = $obj->getUsed();
        $oldType = null;
        if($type == "update"){
            $oldType = $obj->getType() != BuItem::TYPE_SAVING ? $obj->getType() : null;
        }

        /** @var User $user */
        $user = $this->getUser();

        if ($data === null) {
            return $apiResponse->apiJsonResponseBadRequest('Les données sont vides.');
        }

        $obj = $dataEntity->setData($obj, $data);
        $obj->setUser($user);

        if($type == "create" && $data->type == BuItem::TYPE_SAVING){
            $obj->setTotal(0);
            $obj->setUsed(0);
        }

        if($type == "update" && $oldType && $oldType !== $data->type && $data->type == BuItem::TYPE_SAVING){
            $obj->setTotal($oldTotal ?: 0);
            $obj->setUsed($oldUsed ?: 0);
        }

        $noErrors = $validator->validate($obj);
        if ($noErrors !== true) {
            return $apiResponse->apiJsonResponseValidationFailed($noErrors);
        }

        $em->persist($obj);
        $em->flush();

        return $apiResponse->apiJsonResponse($obj, BuCategory::CATEGORY_READ);
    }

    /**
     * @Route("/", name="create", options={"expose"=true}, methods={"POST"})
     *
     * @OA\Response(
     *     response=200,
     *     description="Returns a new object"
     * )
     *
     * @OA\Response(
     *     response=400,
     *     description="JSON empty or missing data or validation failed",
     * )
     *
     * @OA\Tag(name="BudgetCategory")
     *
     * @param Request $request
     * @param ValidatorService $validator
     * @param ApiResponse $apiResponse
     * @param DataCategory $dataEntity
     * @return JsonResponse
     */
    public function create(Request $request, ValidatorService $validator, ApiResponse $apiResponse, DataCategory $dataEntity): JsonResponse
    {
        return $this->submitForm("create", new BuCategory(), $request, $apiResponse, $validator, $dataEntity);
    }

    /**
     * @Route("/{id}", name="update", options={"expose"=true}, methods={"PUT"})
     *
     * @OA\Response(
     *     response=200,
     *     description="Returns an object"
     * )
     * @OA\Response(
     *     response=403,
     *     description="Forbidden for not good role or user",
     * )
     * @OA\Response(
     *     response=400,
     *     description="Validation failed",
     * )
     *
     * @OA\Tag(name="BudgetCategory")
     *
     * @param Request $request
     * @param ValidatorService $validator
     * @param ApiResponse $apiResponse
     * @param BuCategory $obj
     * @param DataCategory $dataEntity
     * @return JsonResponse
     */
    public function update(Request $request, ValidatorService $validator,  ApiResponse $apiResponse, BuCategory $obj, DataCategory $dataEntity): JsonResponse
    {
        return $this->submitForm("update", $obj, $request, $apiResponse, $validator, $dataEntity);
    }

    /**
     * @Route("/{id}/archived", name="switch_archived", options={"expose"=true}, methods={"POST"})
     *
     * @OA\Response(
     *     response=200,
     *     description="Returns object",
     * )
     *
     * @OA\Tag(name="Contact")
     *
     * @param BuCategory $obj
     * @param ApiResponse $apiResponse
     * @return JsonResponse
     */
    public function switchIsPublished(BuCategory $obj, ApiResponse $apiResponse): JsonResponse
    {
        $em = $this->doctrine->getManager();
        $obj->setIsArchived(!$obj->getIsArchived());

        $em->flush();
        return $apiResponse->apiJsonResponse($obj, BuCategory::CATEGORY_READ);
    }

    /**
     * @Route("/{id}", name="delete", options={"expose"=true}, methods={"DELETE"})
     *
     * @OA\Response(
     *     response=200,
     *     description="Return message successful",
     * )
     * @OA\Response(
     *     response=403,
     *     description="Forbidden for not good role or user",
     * )
     *
     * @OA\Tag(name="BudgetCategory")
     *
     * @param BuCategory $obj
     * @param ApiResponse $apiResponse
     * @return JsonResponse
     */
    public function delete(BuCategory $obj, ApiResponse $apiResponse): JsonResponse
    {
        $em = $this->doctrine->getManager();

        /** @var User $user */
        $user = $this->getUser();

        $items = $em->getRepository(BuItem::class)->findBy(['user' => $user, 'category' => $obj]);

        foreach ($items as $item) {
            $item = ($item)
                ->setCategory(null)
                ->setType(BuItem::TYPE_EXPENSE)
            ;
        }

        $em->remove($obj);
        $em->flush();
        return $apiResponse->apiJsonResponseSuccessful("Supression réussie !");
    }

    /**
     * @Route("/use-saving/{id}/{year}/{month}", name="use_saving", options={"expose"=true}, methods={"POST"})
     *
     * @OA\Response(
     *     response=200,
     *     description="Returns an object"
     * )
     * @OA\Response(
     *     response=403,
     *     description="Forbidden for not good role or user",
     * )
     * @OA\Response(
     *     response=400,
     *     description="Validation failed",
     * )
     *
     * @OA\Tag(name="BudgetItem")
     *
     * @param Request $request
     * @param BuCategory $obj
     * @param $year
     * @param $month
     * @param ApiResponse $apiResponse
     * @param ValidatorService $validator
     * @param DataItem $dataEntity
     * @param SerializerInterface $serializer
     * @return JsonResponse
     */
    public function useSaving(Request $request, BuCategory $obj, $year, $month, ApiResponse $apiResponse,
                              ValidatorService $validator, DataItem $dataEntity, SerializerInterface $serializer): JsonResponse
    {
        $em = $this->doctrine->getManager();
        $data = json_decode($request->getContent());

        /** @var User $user */
        $user = $this->getUser();

        if ($data === null) {
            return $apiResponse->apiJsonResponseBadRequest('Les données sont vides.');
        }

        $total = $em->getRepository(BuTotal::class)->findOneBy(['user' => $user, 'year' => $year]);
        if(!$total){
            $total = new BuTotal();
        }

        $price = (float) $data->useSaving;

        $dataTab = [
            "year" => $year,
            "month" => $month,
            "name" => "Economies utilisées " . $price . " €",
            "type" => BuItem::TYPE_EXPENSE,
            "price" => $price,
            "haveCashback" => true,
            "isActive" => true
        ];

        $data = json_decode(json_encode($dataTab));

        /** @var BuItem $item */
        [$item, $total] = $dataEntity->setData(new BuItem(), $data, $user, $total, 0);
        $item->setUseSaving(true);
        $item->setCategory($obj);

        $totaux = $em->getRepository(BuTotal::class)->findBy(['user' => $user], ['year' => "ASC"]);
        foreach($totaux as $tot){
            if($tot->getYear() > $item->getYear()){
                $dataEntity->setTotal($tot, $user, BuItem::TYPE_EXPENSE, $tot->getYear(), $price, 0);
            }
        }

        $noErrors = $validator->validate($item);
        if ($noErrors !== true) {
            return $apiResponse->apiJsonResponseValidationFailed($noErrors);
        }

        $obj->setUsed($price);

        $em->persist($total);
        $em->persist($item);
        $em->flush();

        $item = $serializer->serialize($item, "json", ['groups' => BuItem::ITEM_READ]);
        $obj = $serializer->serialize($obj, "json", ['groups' => BuCategory::CATEGORY_READ]);

        return $apiResponse->apiJsonResponseCustom([
            'item' => $item,
            'category' => $obj
        ]);
    }
}
