<?php

namespace App\Entity\Budget;

use App\Entity\DataEntity;
use App\Entity\User;
use App\Repository\Budget\BuCategoryRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

/**
 * @ORM\Entity(repositoryClass=BuCategoryRepository::class)
 */
class BuCategory extends DataEntity
{
    const CATEGORY_READ = ["category:read"];

    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     * @Groups({"category:read", "item:read"})
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=255)
     * @Groups({"category:read", "item:read"})
     */
    private $name;

    /**
     * @ORM\Column(type="integer")
     * @Groups({"category:read"})
     */
    private $type;

    /**
     * @ORM\Column(type="float", nullable=true)
     * @Groups({"category:read", "item:read"})
     */
    private $goal;

    /**
     * @ORM\Column(type="float", nullable=true)
     * @Groups({"category:read", "item:read"})
     */
    private $total;

    /**
     * @ORM\ManyToOne(targetEntity=User::class, inversedBy="buCategories")
     */
    private $user;

    /**
     * @ORM\OneToMany(targetEntity=BuItem::class, mappedBy="category")
     */
    private $items;

    /**
     * @ORM\Column(type="boolean")
     * @Groups({"category:read"})
     */
    private $isNatif = false;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $icon = "stop";

    /**
     * @ORM\Column(type="boolean")
     */
    private $isArchived = false;

    public function __construct()
    {
        $this->items = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getType(): ?int
    {
        return $this->type;
    }

    public function setType(int $type): self
    {
        $this->type = $type;

        return $this;
    }

    public function getGoal(): ?float
    {
        return $this->goal;
    }

    public function setGoal(?float $goal): self
    {
        $this->goal = $goal;

        return $this;
    }

    public function getTotal(): ?float
    {
        return $this->total;
    }

    public function setTotal(?float $total): self
    {
        $this->total = $total;

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

    /**
     * @return Collection<int, BuItem>
     */
    public function getItems(): Collection
    {
        return $this->items;
    }

    public function addItem(BuItem $item): self
    {
        if (!$this->items->contains($item)) {
            $this->items[] = $item;
            $item->setCategory($this);
        }

        return $this;
    }

    public function removeItem(BuItem $item): self
    {
        if ($this->items->removeElement($item)) {
            // set the owning side to null (unless already changed)
            if ($item->getCategory() === $this) {
                $item->setCategory(null);
            }
        }

        return $this;
    }

    public function getIsNatif(): ?bool
    {
        return $this->isNatif;
    }

    public function setIsNatif(bool $isNatif): self
    {
        $this->isNatif = $isNatif;

        return $this;
    }

    /**
     * @return string
     * @Groups({"category:read"})
     */
    public function getTypeString(): string
    {
        return $this->getBudgetTypeString($this->type);
    }

    public function getIcon(): ?string
    {
        return $this->icon;
    }

    public function setIcon(string $icon): self
    {
        $this->icon = $icon;

        return $this;
    }

    public function getIsArchived(): ?bool
    {
        return $this->isArchived;
    }

    public function setIsArchived(bool $isArchived): self
    {
        $this->isArchived = $isArchived;

        return $this;
    }
}
