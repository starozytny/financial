<?php

namespace App\Controller\Api\Budget;

use App\Entity\Budget\BuCategory;
use App\Entity\Budget\BuItem;
use App\Entity\Budget\BuTotal;
use App\Entity\User;
use App\Service\ApiResponse;
use App\Service\Budget\BudgetService;
use App\Service\Data\Budget\DataItem;
use App\Service\ValidatorService;
use DateTime;
use Doctrine\Common\Persistence\ManagerRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use OpenApi\Annotations as OA;
use Symfony\Component\Serializer\SerializerInterface;

/**
 * @Route("/api/budget/items", name="api_budget_items_")
 */
class ItemController extends AbstractController
{
    private $doctrine;

    public function __construct(ManagerRegistry $doctrine)
    {
        $this->doctrine = $doctrine;
    }

    /**
     * @Route("/data/{year}", name="get_data", options={"expose"=true}, methods={"GET"})
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
     * @OA\Tag(name="BudgetItem")
     *
     * @param $year
     * @param SerializerInterface $serializer
     * @param ApiResponse $apiResponse
     * @param BudgetService $budgetService
     * @return JsonResponse
     */
    public function data($year, SerializerInterface $serializer, ApiResponse $apiResponse, BudgetService $budgetService): JsonResponse
    {
        $em = $this->doctrine->getManager();

        /** @var User $user */
        $user = $this->getUser();

        $objs = $em->getRepository(BuItem::class)->findBy(['user' => $user, 'year' => $year]);
        $totalP = $em->getRepository(BuTotal::class)->findOneBy(['user' => $user, 'year' => ($year - 1)]);
        $totalN = $em->getRepository(BuTotal::class)->findOneBy(['user' => $user, 'year' => $year]);
        if($totalP && !$totalN){
            $total = (new BuTotal())
                ->setUser($user)
                ->setYear($year)
                ->setTotal($totalP->getTotal())
            ;

            $em->persist($total);
            $em->flush();
        }

        $objs = $serializer->serialize($objs, 'json', ['groups' => BuItem::ITEM_READ]);

        return $apiResponse->apiJsonResponseCustom([
            'items' => $objs,
            'totalInit' => $budgetService->getTotalInit($user, $year)
        ]);
    }

    public function submitForm($type, BuItem $obj, Request $request, ApiResponse $apiResponse,
                               ValidatorService $validator, DataItem $dataEntity): JsonResponse
    {
        $em = $this->doctrine->getManager();
        $data = json_decode($request->getContent());

        $oldPrice = $type == "update" ? $obj->getPrice() : 0;

        /** @var User $user */
        $user = $this->getUser();

        if ($data === null) {
            return $apiResponse->apiJsonResponseBadRequest('Les données sont vides.');
        }

        $total = $em->getRepository(BuTotal::class)->findOneBy(['user' => $user, 'year' => (int) $data->year]);
        if(!$total){
            $total = new BuTotal();
        }

        /** @var BuItem $obj */
        [$obj, $total] = $dataEntity->setData($obj, $data, $user, $total, $oldPrice);

        $totaux = $em->getRepository(BuTotal::class)->findBy(['user' => $user], ['year' => "ASC"]);
        foreach($totaux as $tot){
            if($tot->getYear() > $obj->getYear()){
                $dataEntity->setTotal($tot, $user, $obj->getType(), $tot->getYear(), $obj->getPrice(), $oldPrice);
            }
        }

        if($data->category != ""){
            if($category = $em->getRepository(BuCategory::class)->find($data->category)){
                $obj->setCategory($category);

                $category->setTotal($category->getTotal() + $obj->getPrice());
            }
        }

        $noErrors = $validator->validate($obj);
        if ($noErrors !== true) {
            return $apiResponse->apiJsonResponseValidationFailed($noErrors);
        }

        $em->persist($total);
        $em->persist($obj);
        $em->flush();

        return $apiResponse->apiJsonResponse($obj, BuItem::ITEM_READ);
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
     * @OA\Tag(name="BudgetItem")
     *
     * @param Request $request
     * @param ValidatorService $validator
     * @param ApiResponse $apiResponse
     * @param DataItem $dataEntity
     * @return JsonResponse
     */
    public function create(Request $request, ValidatorService $validator, ApiResponse $apiResponse, DataItem $dataEntity): JsonResponse
    {
        return $this->submitForm("create", new BuItem(), $request, $apiResponse, $validator, $dataEntity);
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
     * @OA\Tag(name="BudgetItem")
     *
     * @param Request $request
     * @param ValidatorService $validator
     * @param ApiResponse $apiResponse
     * @param BuItem $obj
     * @param DataItem $dataEntity
     * @return JsonResponse
     */
    public function update(Request $request, ValidatorService $validator,  ApiResponse $apiResponse, BuItem $obj, DataItem $dataEntity): JsonResponse
    {
        return $this->submitForm("update", $obj, $request, $apiResponse, $validator, $dataEntity);
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
     * @OA\Tag(name="BudgetItem")
     *
     * @param BuItem $obj
     * @param ApiResponse $apiResponse
     * @param DataItem $dataEntity
     * @return JsonResponse
     */
    public function delete(BuItem $obj, ApiResponse $apiResponse, DataItem $dataEntity): JsonResponse
    {
        $em = $this->doctrine->getManager();

        /** @var User $user */
        $user = $this->getUser();
        $total = $em->getRepository(BuTotal::class)->findOneBy(['user' => $user, 'year' => $obj->getYear()]);
        if(!$total){
            $total = new BuTotal();
        }

        $totaux = $em->getRepository(BuTotal::class)->findBy(['user' => $user], ['year' => "ASC"]);
        foreach($totaux as $tot){
            if($tot->getYear() >= $obj->getYear()){
                $dataEntity->setTotal($tot, $user, $obj->getType() == BuItem::TYPE_INCOME ? BuItem::TYPE_EXPENSE : BuItem::TYPE_INCOME, $tot->getYear(), $obj->getPrice(), 0);
            }
        }

        if($category = $obj->getCategory()){
            $category->setTotal($category->getTotal() - $obj->getPrice());
        }

        $em->persist($total);
        $em->remove($obj);
        $em->flush();
        return $apiResponse->apiJsonResponseSuccessful("Supression réussie !");
    }

    /**
     * @Route("/{id}/activate", name="activate", options={"expose"=true}, methods={"PUT"})
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
     * @param ApiResponse $apiResponse
     * @param BuItem $obj
     * @return JsonResponse
     */
    public function activate(ApiResponse $apiResponse, BuItem $obj): JsonResponse
    {
        $em = $this->doctrine->getManager();

        $obj->setIsActive(true);
        $obj->setUpdatedAt(new DateTime());

        $em->flush();
        return $apiResponse->apiJsonResponse($obj, BuItem::ITEM_READ);
    }

    /**
     * @Route("/{id}/duplicate", name="duplicate", options={"expose"=true}, methods={"POST"})
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
     * @param ApiResponse $apiResponse
     * @param BuItem $obj
     * @param DataItem $dataEntity
     * @return JsonResponse
     */
    public function duplicate(ApiResponse $apiResponse, BuItem $obj, DataItem $dataEntity): JsonResponse
    {
        $em = $this->doctrine->getManager();

        /** @var User $user */
        $user = $this->getUser();

        $duplicate = clone $obj;

        $createdAt = new DateTime();
        $createdAt->setTimezone(new \DateTimeZone("Europe/Paris"));

        $year = $obj->getMonth() == 12 ? $obj->getYear() + 1: $obj->getYear();
        $month = $obj->getMonth() == 12 ? 1 : $obj->getMonth() + 1;

        $duplicate = ($duplicate)
            ->setCreatedAt($createdAt)
            ->setUpdatedAt(null)
            ->setYear($year)
            ->setMonth($month)
        ;


        $superiorOrEqual = true;
        $total = $em->getRepository(BuTotal::class)->findOneBy(['user' => $user, 'year' => $year]);
        if(!$total){
            $total = new BuTotal();
            $total = $dataEntity->setTotal($total, $user, $obj->getType(), $year, $obj->getPrice(), 0);

            $superiorOrEqual = false;

            $em->persist($total);
            $em->flush();
        }

        $totaux = $em->getRepository(BuTotal::class)->findBy(['user' => $user], ['year' => "ASC"]);
        foreach($totaux as $tot){
            if(($superiorOrEqual && $tot->getYear() >= $year) || (!$superiorOrEqual && $tot->getYear() > $year)){
                $dataEntity->setTotal($tot, $user, $obj->getType(), $tot->getYear(), $obj->getPrice(), 0);
            }
        }

        if($obj->getCategory()){
            $obj->getCategory()->setTotal($obj->getCategory()->getTotal() + $obj->getPrice());
        }

        $em->persist($duplicate);
        $em->flush();
        return $apiResponse->apiJsonResponse($duplicate, BuItem::ITEM_READ);
    }
}
