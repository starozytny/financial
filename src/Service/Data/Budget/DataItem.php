<?php


namespace App\Service\Data\Budget;


use App\Entity\Budget\BuItem;
use App\Entity\Budget\BuTotal;
use App\Entity\User;
use App\Service\SanitizeData;

class DataItem
{
    private $sanitizeData;

    public function __construct(SanitizeData $sanitizeData)
    {
        $this->sanitizeData = $sanitizeData;
    }

    public function setData(BuItem $obj, $data, User $user, ?BuTotal $total = null): array
    {
        $year = $this->sanitizeData->setToInteger($data->year, 0);
        $type = $this->sanitizeData->setToInteger($data->type, 0);
        $price = $this->sanitizeData->setToFloat($data->price, 0);

        if($total){
            $total = $this->setTotal($total, $user, $type, $year, $price);
        }

        $obj = ($obj)
            ->setUser($user)
            ->setYear($year)
            ->setMonth($this->sanitizeData->setToInteger($data->month, 0))
            ->setName($this->sanitizeData->trimData($data->name))
            ->setType($type)
            ->setPrice($price)
        ;

        return [$obj, $total];
    }

    public function setTotal(BuTotal $total, User $user, $type, $year, $price): BuTotal
    {
        $nTotal = $total->getTotal() ?: 0;
        if($type == BuItem::TYPE_INCOME){
            $nTotal += $price;
        }else{
            $nTotal -= $price;
        }

        return ($total)
            ->setUser($user)
            ->setYear($year)
            ->setTotal($nTotal)
        ;
    }
}