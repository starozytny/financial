<?php

namespace App\Controller\Api\Budget;

use App\Entity\Budget\BuCategory;
use App\Entity\Budget\BuItem;
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

        /** @var User $user */
        $user = $this->getUser();

        if ($data === null) {
            return $apiResponse->apiJsonResponseBadRequest('Les données sont vides.');
        }

        $obj = $dataEntity->setData($obj, $data);
        $obj->setUser($user);

        if($type == "create" && $data->type == 2){
            $obj->setTotal(0);
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
     * @param DataService $dataService
     * @return JsonResponse
     */
    public function delete(BuCategory $obj, DataService $dataService): JsonResponse
    {
        return $dataService->delete($obj);
    }
}
