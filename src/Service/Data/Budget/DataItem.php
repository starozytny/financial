<?php


namespace App\Service\Data\Budget;


use App\Entity\Budget\BuItem;
use App\Service\SanitizeData;

class DataItem
{
    private $sanitizeData;

    public function __construct(SanitizeData $sanitizeData)
    {
        $this->sanitizeData = $sanitizeData;
    }

    public function setData(BuItem $obj, $data): BuItem
    {
        return ($obj)
            ->setYear($this->sanitizeData->setToInteger($data->year, 0))
            ->setMonth($this->sanitizeData->setToInteger($data->month, 0))
            ->setType($this->sanitizeData->setToInteger($data->type, 0))
            ->setPrice($this->sanitizeData->setToFloat($data->price, 0))
            ->setName($this->sanitizeData->trimData($data->name))
        ;
    }
}