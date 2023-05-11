import { Component } from '@angular/core';

declare const require: any;

@Component({
  selector: 'explorer',
  templateUrl: './explorer.template.html',
  styleUrls: [require("./explorer.component.css")],
})

export class ExplorerComponent {
  private listsJSON = require('./explorer.json');
  private lists = [];
  private current: Item;

  private lines: Line[] = [];

  private linesDrawn = true;

  constructor() {
    for (let i = 0; i < this.listsJSON.length; i++) {
      this.lists.push({
        title: this.listsJSON[i].title,
        items: this.listsJSON[i].items.map(
          item =>
          Object.assign({score: 0, lines: []}, item)
        )});
    }
    for (let i = 0; i < this.listsJSON.length; i++) {
      this.lists[i].items.forEach(
        item => {
          item.forward = item.forward ?
            item.forward
            .map(itemString => this.findItem(itemString, i + 1))
            .filter(itemCheck => itemCheck)
            : [];
          item.backward = item.backward ?
            item.backward
            .map((itemString: string) => this.findItem(itemString, i - 1))
            .filter(itemCheck => itemCheck)
            : [];
        }
      );
    }
    // console.log(this.lists);
    this.sortLists();
  }

  private sortLists() {
    this.lists.forEach((list: List) => {
        list.items = list.items.sort(this.sortItem);
      }
    );
  }

  private onInit(): void {
    this.findPositions();
  }

  private findPositions(): void {
    for (let i = 0; i < this.lists.length; i++) {
      this.lists[i].items.forEach((item: Item) => {
        const el = (document.getElementById(i + item.title));
        item.back = this.getPos(el, false);
        item.front = this.getPos(el, true);
        });
    }
  }

  private getPos(el: any, front: boolean): Point {

    // console.log(el);

    const rect = el.getBoundingClientRect();

    return {
        x: front ? rect.right : rect.left,
        y: (rect.top + rect.bottom) / 2
      // width: rect.width || el.offsetWidth,
      // height: rect.height || el.offsetHeight
    };
  }

  private sortItem(a: Item, b: Item): number {
    const ret = b.score - a.score;
    if (a.selected && !b.selected) {
      return -1;
    } else if (!a.selected && b.selected) {
      return 1;
    } else {
        // console.log(a, b)
      return ret === 0 ? a.title.localeCompare(b.title) : ret;
    }
  }

  private select(item: Item, index: number): void {
    item.selected = !item.selected;
    const prev = index > 0 ? this.lists[index - 1].items : null;
    const next = index < this.lists.length - 1 ? this.lists[index + 1].items : null;
    const delta = item.selected ? 1 : -1;
    if (item.selected) {
      this.current = item;
    } else if (this.current === item) {
      this.current = null;
    }
    this.changeScores(item.backward, delta);
    this.changeScores(item.forward, delta);

    this.sortLists();
    this.findPositions();
    this.drawLines();
  }



  private drawLines(): void {
    this.lines = [];
    for (let i = 0; i < this.lists.length; i++) {
      this.lists[i].items
        .filter((item: Item) => item.selected)
        .forEach((item: Item) => this.addLines(item, i + 1));
    }
    this.linesDrawn = true;
  }

  private addLines(item: Item, listNum: number): void {
    if (item.forward) {
      item.forward.forEach((nextItem) => {
        // console.log(item.front.x);
        if (nextItem) {
          this.lines.push({x1: item.front.x, x2: nextItem.back.x, y1: item.front.y, y2: nextItem.back.y});
        }
      }
      );
    }
  }

  private findItem(title: string, listNum: number): Item {
    return this.lists[listNum].items.find((item: Item) => title === item.title);
  }


  private changeScores(items: Item[], delta: number): void {
    if (items !== null) {
    //   console.log(items);
      items.forEach((item: Item) => item.score += delta);
    }
  }
}



export interface Item {
  title: string;
  info: string;
  forward?: Item[];
  backward?: Item[];
  score?: number;
  selected?: boolean;
  url?: string;
  front?: Point;
  back?: Point;
}

interface List {
  title: string;
  items: Item[];
}

interface Line {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

interface Point {
  x: number;
  y: number;
}
