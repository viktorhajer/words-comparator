import { Component, OnChanges } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  // Inputs
  word1: string = 'apple';
  word2: string = 'appel';

  // Workspace
  matrix: number[][] = [[]];
  sequences: Sequence[] = [];
  noSequences: Sequence[] = [];
  highlightedFields: Sequence[] = [];
  characterSeq: CharacterSeq[] = [];

  compare() {
    this.initWorkspace();
    this.normalizeInputs();
    if (this.word1.length > 0 && this.word2.length > 0) {
      this.createMatrix();
      this.createSequences();
      this.normalizeSequences();
      this.analysis();
      this.showResult();
    }
  }

  private analysis() {
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
    this.sequences.sort(Sequence.sort);
    let sum = this.sequences[0].l;
    for (let i = 1; i < this.sequences.length; i++) {
      if ((this.sequences[i-1].x+this.sequences[i-1].l) > this.sequences[i].x ||
        (this.sequences[i-1].y+this.sequences[i-1].l) > this.sequences[i].y) {
        if (sum > this.sequences[i].l) {
          this.noSequences.push(this.sequences[i]);
          this.sequences = this.sequences.filter(seq => seq != this.sequences[i]);
          i--;
        } else {
          for (let j = 0; j < i; j++) {
            this.noSequences.push(this.sequences[j]);
          }
          sum = this.sequences[i].l;
          this.sequences = this.sequences.slice(i, this.sequences.length);
          i = 1;
        }
      } else {
        sum += this.sequences[i].l;
      }
    }
  }

  private showResult() {
    console.log(this.matrix);
    console.log(this.sequences);
    console.log(this.noSequences);
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

  getHighlightedFields() {
    if (this.highlightedFields.length === 0) {
      this.sequences.forEach(seq => {
        for (let i = 0; i < seq.l; i++) {
          this.highlightedFields.push(new Sequence(seq.x + i, seq.y + i, 1));
        }
      });
    }
    return this.highlightedFields;
  }

  isUsedItem(i: number, j: number) {
    if (!!this.getHighlightedFields().find(seq => seq.y == j && seq.x == i)) {
      return true;
    }
    return false;
  }
}

class CharacterSeq {
  constructor(public pos: number, public c: string, public flag: number) {
  }
}

class Sequence {
  constructor(public x: number, public y: number, public l: number) {
  }
  static sort(s1:Sequence, s2:Sequence) {
    if (s1.y > s2.y) {
      return 1;
    } else if (s1.y < s2.y) {
      return -1;
    } else {
      return 0;
    }
  }
}