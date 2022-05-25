import { Injectable } from '@angular/core';

@Injectable()
export class FileService {
  constructor() {}

  convertToCSV(objArray: any): string {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';
    var row = '';

    for (var index in objArray[0]) {
      row += index + ',';
    }
    row = row.slice(0, -1);
    str += row + '\r\n';

    for (var i = 0; i < array.length; i++) {
      var line = '';
      for (var index in array[i]) {
        if (line != '') line += ',';
        const value =
          '"' +
          array[i][index]
            .toString()
            .replaceAll('\n', ' ')
            .replaceAll('"', '""') +
          '"';
        line += value;
      }
      str += line + '\r\n';
    }
    return str;
  }

  getBlob(objArray: any): Blob {
    const csvData = this.convertToCSV(objArray);
    return new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  }
}
