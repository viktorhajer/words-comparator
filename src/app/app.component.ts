import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  // Inputs
  word1: string = 'alma';
  word2: string = 'alda';

  // Workspace
  matrix: number[][] = [[]];
  sequences: Sequence[] = [];
  noSequences: Sequence[] = [];

  compare() {

    this.word1 = 'pálinka';
    this.word2 = 'pántlika';

    this.initWorkspace();
    this.normalizeInputs();
    if (this.word1.length > 0 && this.word2.length > 0)  {
      this.createMatrix();
      this.createSequences();
      this.analysis();
      this.showResult();
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
    this.sequences.sort(Sequence.sort);
    for (let i = 1; i < this.sequences.length; i++) {
      if(this.sequences[i-1].x >= this.sequences[i].x || this.sequences[i-1].y >= this.sequences[i].y) {
        this.noSequences.push(this.sequences[i-1].l > this.sequences[i].l ? this.sequences[i] : this.sequences[i-1]);
      }
    }
    this.sequences = this.sequences.filter(seq => this.noSequences.indexOf(seq) == -1);
  }

  private analysis() {

  }

  private showResult() {
    console.log(this.matrix);
    console.log(this.sequences);
    console.log(this.noSequences);
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
  }
}

class Character {
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