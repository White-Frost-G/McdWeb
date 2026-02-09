import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Item, ItemType, StepperType, UnitType} from '../../models/item';
import {ItemsService} from '../../services/items-service';

interface DisplayItem {
  item: Item;
  count: number;
  showSteppers: boolean;
}
interface GroupedResult {
  type: ItemType;
  typeName: string;
  items: { name: string; count: number; unit: string }[];
  totalCount: number;
}

@Component({
  selector: 'app-waste-page',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './waste-page.html',
  styleUrl: './waste-page.css',
})
export class WastePage implements OnInit {
  items: DisplayItem[] = [];
  groupedResults: GroupedResult[] = [];
  copySuccess = signal(false);

  private readonly typeNames: Map<ItemType, string> = new Map([
    [ItemType.RawWaste, 'Raw Waste'],
    [ItemType.EndWaste, 'End Waste'],
  ]);

  constructor(private itemService: ItemsService) {}

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.itemService.getItems().subscribe({
      next: (items: any[]) => {
        this.items = items.map(item => ({
          item,
          count: 0,
          showSteppers: false
        }));
      },
      error: (error: any[]) => {
        console.error('Error loading items:', error);
      }
    });
  }

  getStepperValues(item: Item): number[] {
    if (item.customStepper && item.customStepper.length > 0) {
      return item.customStepper;
    }

    switch(item.stepperType) {
      case StepperType.SmallCounter:
        return [15, 9, 3, -3, -9, -15];
      case StepperType.NormalCounter:
        return [50, 15, 5, -5, -15, -50];
      case StepperType.BigCounter:
        return [100, 50, 10, -10, -50, -100];
      case StepperType.HugeCounter:
        return [500, 200, 50, -50, -200, -500];
      default:
        return [15, 9, 3, -3, -9, -15];
    }
  }

  getUnitStep(item: Item): number {
    switch(item.unitType) {
      case UnitType.Item:
        return 1;
      case UnitType.Gram:
        return 100;
      default:
        return 1;
    }
  }

  getUnitName(item: Item): string {
    switch(item.unitType) {
      case UnitType.Item: return 'pcs';
      case UnitType.Gram: return 'g';
      default: return 'pcs';
    }
  }

  incrementCount(index: number) {
    const step = this.getUnitStep(this.items[index].item);
    this.items[index].count += step;
    this.items[index].count = Math.max(this.items[index].count, 0);
    this.updateResult();
  }

  decrementCount(index: number) {
    const step = this.getUnitStep(this.items[index].item);
    this.items[index].count = Math.max(this.items[index].count - step, 0);
    this.updateResult();
  }

  toggleSteppers(index: number) {
    this.items[index].showSteppers = !this.items[index].showSteppers;
  }

  adjustCount(index: number, amount: number) {
    const newCount = this.items[index].count + amount;
    this.items[index].count = Math.max(newCount, 0);
    this.updateResult();
  }

  updateResult() {
    // Group items by their ItemType(s)
    const typeMap = new Map<ItemType, GroupedResult>();

    // Initialize groups for all known types
    this.typeNames.forEach((typeName, type) => {
      typeMap.set(type, {
        type: type,
        typeName: typeName,
        items: [],
        totalCount: 0
      });
    });

    // Distribute items to their types
    this.items
      .filter(item => item.count > 0)
      .forEach(displayItem => {
        const item = displayItem.item;
        const unit = this.getUnitName(item);

        // Check each possible type
        this.typeNames.forEach((typeName, type) => {
          // Check if item has this type (using bitwise AND for flag enum)
          if ((item.canBe & type) === type) {
            const group = typeMap.get(type)!;
            group.items.push({
              name: item.showName || item.name,
              count: item.unitType === UnitType.Item ?
                Math.round(displayItem.count) :
                parseFloat(displayItem.count.toFixed(2)),
              unit: unit
            });
            group.totalCount += displayItem.count;
          }
        });
      });

    // Convert to array and filter out empty groups
    this.groupedResults = Array.from(typeMap.values())
      .filter(group => group.items.length > 0)
      .sort((a, b) => a.type - b.type);
  }
  getResultText(): string {
    let text = 'Waste:\n\n';

    this.groupedResults.forEach(group => {
      text += `${group.typeName}:\n`;
      group.items.forEach(item => {
        text += `${item.name}=> ${item.count}${item.unit}\n`;
      });
    });

    return text;
  }
  async copyResult() {
    try {
      const text = this.getResultText();
      await navigator.clipboard.writeText(text);
      this.copySuccess.set(true);

      // Reset success message after 2 seconds
      setTimeout(() => {
        this.copySuccess.set(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = this.getResultText();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.copySuccess.set(true);

      setTimeout(() => {
        this.copySuccess.set(false);
      }, 2000);
    }
  }

  getTypeName(type: ItemType): string {
    return this.typeNames.get(type) || 'Unknown Type';
  }
  getItemTypes(item: Item): ItemType[] {
    const types: ItemType[] = [];

    // Check each known type
    this.typeNames.forEach((typeName, type) => {
      // Skip None type
      if (type === ItemType.None) return;

      // Check if item has this type (bitwise AND)
      if ((item.canBe & type) === type) {
        types.push(type);
      }
    });

    return types;
  }

  getDisplayName(item: Item): string {
    return item.showName || item.name;
  }

}
