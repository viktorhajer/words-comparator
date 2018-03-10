import { Component, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  // Inputs
  word1: string = 'apple';
  word2: string = 'appel';

  // Workspace
  matrix: number[][] = [[]];
  sequences: Sequence[] = [];
  noSequences: Sequence[] = [];
  highlightedFields: Sequence[] = [];
  characterSeq: CharacterSeq[] = [];

  ngOnInit() {
    /*this.word1 = 'aaba';
    this.word2 = 'abaa';*/
    this.compare();
  }

  compare() {
    this.initWorkspace();
    this.normalizeInputs();
    if (this.word1.length > 0 && this.word2.length > 0) {
      this.createMatrix();
      this.createSequences();
      this.normalizeSequences();
      this.createResult();
      this.showResult();
    }
  }

  private createResult() {
    let startX = 0;
    let startY = 0;
    let pos = 0;
    this.sequences.forEach(seq => {
      if (seq.x - startX != 0) {
        this.characterSeq.push(new CharacterSeq(pos, this.word2.substr(startX, seq.x - startX), 1));
      }
      startX = seq.x + seq.l;
      if (seq.y - startY != 0) {
        this.characterSeq.push(new CharacterSeq(pos, this.word1.substr(startY, seq.y - startY), 2));
      }
      startY = seq.y + seq.l;
      pos++;
      this.characterSeq.push(new CharacterSeq(pos, this.word1.substr(seq.y, seq.l), 0));
      pos++;
    });
    if (this.word2.length > startX) {
      this.characterSeq.push(new CharacterSeq(pos, this.word2.substr(startX), 1));
    }
    if (this.word1.length > startY) {
      this.characterSeq.push(new CharacterSeq(pos, this.word1.substr(startY), 2));
    }
  }

  private createMatrix() {
    for (let j = 0; j < this.word2.length; j++) {
      this.matrix[j] = [];
      for (let i = 0; i < this.word1.length; i++) {
        this.matrix[j][i] = 0;
        if (this.word1[i] === this.word2[j]) {
          this.matrix[j][i]++;
          if (i > 0 && j > 0) {
            this.matrix[j][i] += this.matrix[j-1][i-1];
          }
        }
      }
    }
  }

  private createSequences() {
    for (let j = 0; j < this.matrix.length; j++) {
      for (let i = 0; i < this.matrix[j].length; i++) {
        if (this.matrix[j][i] === 1) {
          let point = 0;
          let k = i, l = j;
          while(this.matrix[l][k] > 0) {
            point++;
            if ((l+1) < this.matrix.length && (k+1) < this.matrix[j].length) {
              k++; l++;
            } else {
              break;
            }
          }
          this.sequences.push(new Sequence(j, i, point));
        }
      }
    }
  }

  private normalizeSequences() {
    if(this.sequences.length > 2) {

      console.log('Start');
      console.log(this.sequences);

      // sort by Y and X coords
      this.sequences.sort(Sequence.sort);
      // start at the second position
      for (let i = 1; i < this.sequences.length; i++) {
        // if the previous position is greater than the actual one then one of them should be removed
        if (this.sequences[i-1].xl > this.sequences[i].x || this.sequences[i-1].yl > this.sequences[i].y) {


          let [sum, index] = this.getLength(i);
          console.log('Action:');
          console.log(' - act: ' + this.sequences[i].toString());
          console.log(' - pre: ' + this.sequences[i-1].toString());
          console.log(' - sum: ' + sum);
          console.log(' - index: ' + index);
          console.log(' - i: ' + i);

          // we should remove the actual
          if (sum >= this.sequences[i].l) {
            this.noSequences.push(this.sequences[i]);
            this.sequences = this.sequences.filter(seq => seq != this.sequences[i]);
            i--;
            console.log(' -- Remove act');
          
          // we should remove the previous one(s)
          } else {
            let actual = this.sequences[i];
            let tail = this.sequences.slice(0, index);
            let head = this.sequences.slice(i);
            this.sequences = [];
            this.sequences.push(...tail, ...head);
            i = index;
            console.log(' -- Remove prevs, new index: ' + i);
          }

          console.log(this.sequences);
        }
      }
    }
  }

  private getLength(from: number): number[] {
    let sum = 0;
    let index = from-1;
    for(let index = from-1; index >= 0; index--) {
      if ((this.sequences[index].xl) > this.sequences[from].x || (this.sequences[index].yl) > this.sequences[from].y) {
        sum += this.sequences[index].l;
      } else {
        break;
      }
    }
    return [sum, index];
  }

  private showResult() {
    console.log(this.matrix);
    console.log(this.characterSeq);
  }

  private normalizeInputs() {
    this.word1 = this.normalizeWord(this.word1);
    this.word2 = this.normalizeWord(this.word2);;
  }

  private normalizeWord(word: string): string {
    return word ? word.trim() : '';
  }

  private initWorkspace() {
    this.matrix = [[]];
    this.sequences = [];
    this.noSequences = [];
    this.characterSeq= [];
    this.highlightedFields = [];
  }

  getWordAsList(word: string): string[] {
    let list: string[] = [];
    for (let i = 0; i < word.length; i++) {
      list.push(word[i]);
    }
    return list;
  }

  isUsedItem(i: number, j: number) {
    if (!!this.getHighlightedFields().find(seq => seq.y == j && seq.x == i)) {
      return true;
    }
    return false;
  }

  private getHighlightedFields() {
    if (this.highlightedFields.length === 0) {
      this.sequences.forEach(seq => {
        for (let i = 0; i < seq.l; i++) {
          this.highlightedFields.push(new Sequence(seq.x + i, seq.y + i, 1));
        }
      });
    }
    return this.highlightedFields;
  }
}

class CharacterSeq {
  constructor(public pos: number, public c: string, public flag: number) {
  }
}

class Sequence {
  public xl: number;
  public yl: number;
  constructor(public x: number, public y: number, public l: number) {
    this.xl = this.x + this.l;
    this.yl = this.y + this.l;
  }
  toString(): string {
    return this.x + ', ' + this.y + ' - ' + this.l;
  }
  static sort(s1:Sequence, s2:Sequence) {
    if (s1.y > s2.y) {
      return 1;
    } else if (s1.y < s2.y) {
      return -1;
    } else {
      if (s1.x > s2.x) {
        return 1;
      } else if (s1.x < s2.x) {
        return -1;
      } else {
        return 0;
      }
    }
  }
}