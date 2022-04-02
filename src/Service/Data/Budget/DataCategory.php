<?php


namespace App\Service\Data\Budget;


use App\Entity\Budget\BuCategory;
use App\Service\SanitizeData;

class DataCategory
{
    private $sanitizeData;

    public function __construct(SanitizeData $sanitizeData)
    {
        $this->sanitizeData = $sanitizeData;
    }

    public function setData(BuCategory $obj, $data): BuCategory
    {
        return ($obj)
            ->setName($this->sanitizeData->trimData($data->name))
            ->setType($this->sanitizeData->setToInteger($data->type, 0))
            ->setGoal($this->sanitizeData->setToFloat($data->goal))
            ->setTotal($this->sanitizeData->setToFloat($data->total))
        ;
    }
}