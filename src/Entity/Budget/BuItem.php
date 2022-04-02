<?php

namespace App\Entity\Budget;

use App\Entity\DataEntity;
use App\Entity\User;
use App\Repository\Budget\BuItemRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

/**
 * @ORM\Entity(repositoryClass=BuItemRepository::class)
 */
class BuItem extends DataEntity
{
    const ITEM_READ = ["item:read"];

    const TYPE_EXPENSE = 0;
    const TYPE_INCOME = 1;
    const TYPE_SAVING = 2;

    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     * @Groups({"item:read"})
     */
    private $id;

    /**
     * @ORM\Column(type="integer")
     * @Groups({"item:read"})
     */
    private $year;

    /**
     * @ORM\Column(type="integer")
     * @Groups({"item:read"})
     */
    private $month;

    /**
     * @ORM\Column(type="integer")
     * @Groups({"item:read"})
     */
    private $type;

    /**
     * @ORM\Column(type="float")
     * @Groups({"item:read"})
     */
    private $price;

    /**
     * @ORM\Column(type="string", length=255)
     * @Groups({"item:read"})
     */
    private $name;

    /**
     * @ORM\ManyToOne(targetEntity=User::class, inversedBy="buItems")
     * @ORM\JoinColumn(nullable=false)
     */
    private $user;

    /**
     * @ORM\Column(type="datetime")
     * @Groups({"item:read"})
     */
    private $createdAt;

    /**
     * @ORM\ManyToOne(targetEntity=BuCategory::class, fetch="EAGER", inversedBy="items")
     * @Groups({"item:read"})
     */
    private $category;

    public function __construct()
    {
        $this->createdAt = $this->initNewDate();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getYear(): ?int
    {
        return $this->year;
    }

    public function setYear(int $year): self
    {
        $this->year = $year;

        return $this;
    }

    public function getMonth(): ?int
    {
        return $this->month;
    }

    public function setMonth(int $month): self
    {
        $this->month = $month;

        return $this;
    }

    public function getPrice(): ?float
    {
        return $this->price;
    }

    public function setPrice(float $price): self
    {
        $this->price = $price;

        return $this;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): self
    {
        $this->user = $user;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeInterface $createdAt): self
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getType(): ?int
    {
        return $this->type;
    }

    public function setType(int $type): self
    {
        $this->type = $type;

        return $this;
    }

    /**
     * @return string|null
     * @Groups({"item:read"})
     */
    public function getCreatedAtString(): ?string
    {
        return $this->getFullDateString($this->createdAt);
    }

    public function getCategory(): ?BuCategory
    {
        return $this->category;
    }

    public function setCategory(?BuCategory $category): self
    {
        $this->category = $category;

        return $this;
    }
}
