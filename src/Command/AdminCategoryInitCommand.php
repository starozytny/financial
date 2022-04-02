<?php

namespace App\Command;

use App\Entity\Budget\BuCategory;
use App\Entity\Budget\BuItem;
use App\Service\Data\Budget\DataCategory;
use App\Service\DatabaseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

class AdminCategoryInitCommand extends Command
{
    protected static $defaultName = 'admin:category:init';
    protected static $defaultDescription = 'Init categories';
    private $em;
    private $databaseService;
    private $dataEntity;

    public function __construct(EntityManagerInterface $entityManager, DatabaseService $databaseService, DataCategory $dataEntity)
    {
        parent::__construct();

        $this->em = $entityManager;
        $this->databaseService = $databaseService;
        $this->dataEntity = $dataEntity;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

//        $io->title('Reset des tables');
//        $this->databaseService->resetTable($io, [BuCategory::class]);

        $existe = $this->em->getRepository(BuCategory::class)->findAll();
        if(count($existe) != 0){
            $io->text("Catégories déjà existantes.");
            return Command::FAILURE;
        }

        $values = [
            [ "name" => "Alimentation",             "type" => BuItem::TYPE_EXPENSE ],
            [ "name" => "Cadeaux",                  "type" => BuItem::TYPE_EXPENSE ],
            [ "name" => "Santé/médecine",           "type" => BuItem::TYPE_EXPENSE ],
            [ "name" => "Habitation",               "type" => BuItem::TYPE_EXPENSE ],
            [ "name" => "Transports",               "type" => BuItem::TYPE_EXPENSE ],
            [ "name" => "Dépenses personnelles",    "type" => BuItem::TYPE_EXPENSE ],
            [ "name" => "Animaux de compagnie",     "type" => BuItem::TYPE_EXPENSE ],
            [ "name" => "Électricité, eau, gaz",    "type" => BuItem::TYPE_EXPENSE ],
            [ "name" => "Voyage",                   "type" => BuItem::TYPE_EXPENSE ],
            [ "name" => "Dettes",                   "type" => BuItem::TYPE_EXPENSE ],
            [ "name" => "Forfait",                  "type" => BuItem::TYPE_EXPENSE ],

            [ "name" => "Salaire",                  "type" => BuItem::TYPE_INCOME ],
            [ "name" => "Bonus",                    "type" => BuItem::TYPE_INCOME ],
            [ "name" => "Intérêts",                 "type" => BuItem::TYPE_INCOME ],
        ];


        $io->title('Initialisation des catégories');
        foreach ($values as $item) {

            $data = [
                "name" => $item["name"],
                "type" => $item["type"],
                "goal" => null,
                "total" => null
            ];

            $data = json_decode(json_encode($data));

            $new = $this->dataEntity->setData(new BuCategory(), $data);
            $new->setIsNatif(true);

            $this->em->persist($new);
        }

        $io->text('CATEGORIES : Catégories initialisées' );

        $this->em->flush();

        $io->newLine();
        $io->comment('--- [FIN DE LA COMMANDE] ---');
        return 0;
    }
}
