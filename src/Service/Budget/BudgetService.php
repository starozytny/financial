<?php

namespace App\Service\Budget;

use App\Entity\Budget\BuTotal;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class BudgetService
{
    private $em;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->em = $entityManager;
    }

    public function getTotalInit(User $user, int $year): float
    {
        $total = $this->em->getRepository(BuTotal::class)->findOneBy(['user' => $user, 'year' => ($year - 1)]);
        return $total ? $total->getTotal() : 0;
    }
}