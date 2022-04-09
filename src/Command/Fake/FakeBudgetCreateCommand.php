<?php

namespace App\Command\Fake;

use App\Entity\Budget\BuItem;
use App\Entity\Budget\BuTotal;
use App\Entity\User;
use App\Service\Data\Budget\DataItem;
use App\Service\DatabaseService;
use Doctrine\ORM\EntityManagerInterface;
use Faker\Factory;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

class FakeBudgetCreateCommand extends Command
{
    protected static $defaultName = 'fake:budget:create';
    protected static $defaultDescription = 'Create fake budget';
    private $em;
    private $databaseService;
    private $dataEntity;

    public function __construct(EntityManagerInterface $entityManager, DatabaseService $databaseService, DataItem $dataEntity)
    {
        parent::__construct();

        $this->em = $entityManager;
        $this->databaseService = $databaseService;
        $this->dataEntity = $dataEntity;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('Reset des tables');
        $this->databaseService->resetTable($io, [BuTotal::class, BuItem::class]);

        $user = $this->em->getRepository(User::class)->findOneBy(['username' => "shanbo"]);

        $io->title('Création de 500 budgets fake');
        $fake = Factory::create();
        for($i=0; $i<500 ; $i++) {

            $data = [
                "year" => $fake->numberBetween(2022, 2024),
                "month" => $fake->numberBetween(1, 12),
                "type" => $fake->numberBetween(0, 2),
                "price" => $fake->randomFloat(1),
                "name" => $fake->name,
                "category" => null,
                "haveCashback" => false
            ];

            $data = json_decode(json_encode($data));

            [$new, $total] = $this->dataEntity->setData(new BuItem(), $data, $user);

            $this->em->persist($new);
        }
        $io->text('BUDGET : Budget fake créés' );

        $this->em->flush();

        $io->newLine();
        $io->comment('--- [FIN DE LA COMMANDE] ---');
        return Command::SUCCESS;
    }
}
