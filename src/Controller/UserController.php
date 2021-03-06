<?php

namespace App\Controller;

use App\Entity\Budget\BuCategory;
use App\Entity\Budget\BuItem;
use App\Entity\User;
use App\Service\Budget\BudgetService;
use Doctrine\Common\Persistence\ManagerRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

/**
 * @Route("/espace-membre", name="user_")
 */
class UserController extends AbstractController
{
    private $doctrine;

    public function __construct(ManagerRegistry $doctrine)
    {
        $this->doctrine = $doctrine;
    }

    /**
     * @Route("/", options={"expose"=true}, name="homepage")
     */
    public function index(SerializerInterface $serializer, BudgetService $budgetService): Response
    {
        $em = $this->doctrine->getManager();
        /** @var User $user */
        $user = $this->getUser();

        $year = (new \DateTime())->format("Y");
        $items      = $em->getRepository(BuItem::class)->findBy(['user' => $user, 'year' => $year]);
        $categories = $em->getRepository(BuCategory::class)->findBy(['user' => [null, $user], 'isArchived' => false]);

        $items       = $serializer->serialize($items, 'json', ['groups' => BuItem::ITEM_READ]);
        $categories  = $serializer->serialize($categories, 'json', ['groups' => BuCategory::CATEGORY_READ]);

        return $this->render('user/pages/index.html.twig', [
            'donnees' => $items,
            'categories' => $categories,
            'year' => $year,
            'totalInit' => $budgetService->getTotalInit($user, $year)
        ]);
    }

    /**
     * @Route("/profil", options={"expose"=true}, name="profil")
     */
    public function profil(): Response
    {
        /** @var User $obj */
        $obj = $this->getUser();

        return $this->render('user/pages/profil/index.html.twig',  [
            'obj' => $obj
        ]);
    }

    /**
     * @Route("/modifier-profil", name="profil_update")
     */
    public function profilUpdate(SerializerInterface $serializer): Response
    {
        /** @var User $data */
        $data = $this->getUser();
        $data = $serializer->serialize($data, 'json', ['groups' => User::ADMIN_READ]);
        return $this->render('user/pages/profil/update.html.twig',  ['donnees' => $data]);
    }

    /**
     * @Route("/categories", name="categories")
     */
    public function categories(SerializerInterface $serializer): Response
    {
        $em = $this->doctrine->getManager();

        /** @var User $user */
        $user = $this->getUser();
        $data = $em->getRepository(BuCategory::class)->findBy(['user' => [null, $user]]);

        $data = $serializer->serialize($data, 'json', ['groups' => BuCategory::CATEGORY_READ]);

        return $this->render('user/pages/category/index.html.twig', [
            'donnees' => $data
        ]);
    }

    /**
     * @Route("/categories/economies", name="saving")
     */
    public function saving(SerializerInterface $serializer): Response
    {
        $em = $this->doctrine->getManager();

        /** @var User $user */
        $user = $this->getUser();
        $data  = $em->getRepository(BuCategory::class)->findBy(['user' => [null, $user], "type" => BuItem::TYPE_SAVING]);
        $items = $em->getRepository(BuItem::class)->findBy(['user' => $user, 'category' => $data]);

        $data  = $serializer->serialize($data, 'json', ['groups' => BuCategory::CATEGORY_READ]);
        $items = $serializer->serialize($items, 'json', ['groups' => BuItem::ITEM_READ]);

        return $this->render('user/pages/category/saving.html.twig', [
            'donnees' => $data,
            'items' => $items,
        ]);
    }
}
