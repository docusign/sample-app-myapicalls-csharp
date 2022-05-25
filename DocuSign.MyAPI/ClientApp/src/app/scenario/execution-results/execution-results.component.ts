import { Component, OnInit, Inject, Input } from '@angular/core';
import { formatDate } from '@angular/common';
import { IScenarioExecutionResult } from '../models/scenario-execution-result';
import { ExecutionResultService } from '../services/execution-result.service';
import { AppSettings } from '../../app.settings';
import { FileService } from '../services/file.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-execution-results',
  templateUrl: './execution-results.component.html',
  styleUrls: ['./execution-results.component.scss'],
})
export class ExecutionResultsComponent implements OnInit {
  results: IScenarioExecutionResult[] = [];
  accountId: string = '';

  displayedColumns: string[] = [
    'time',
    'scenarioName',
    'stepName',
    'apiCall',
    'request',
    'response',
  ];

  constructor(
    @Inject(ExecutionResultService)
    private executionResultService: ExecutionResultService,
    @Inject(FileService) private fileService: FileService,
    @Inject(TranslateService) private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.translateService
      .get('EXECUTE.RESULTS.TITLE')
      .subscribe((translated: string) => {});

    this.executionResultService.getResults().subscribe((results) => {
      this.results = [...results];
    });
    this.executionResultService.resultItems.subscribe((results) => {
      this.results = [...results];
    });
  }

  getFormattedDate(date: Date): string {
    return formatDate(date, AppSettings.DATE_TIME_FORMAT, 'en_US');
  }

  getRequestBody(body: string): string {
    try {
      const json = JSON.parse(body);

      this.truncateNodeValue(json);

      return JSON.stringify(json, null, 1);
    } catch (e) {
      return body;
    }
  }

  truncateNodeValue(node: any) {
    Object.entries(node).map((child) => {
      const value = child[1];

      if (value != null && typeof value === 'object') {
        this.truncateNodeValue(value);
      } else if (typeof value === 'string' && value.length > 50) {
        node[child[0]] = value.substring(0, 50) + '...';
      }
    });
  }

  localizeResponseBody(response: string): string {
    if (response === '') {
      return this.translateService.instant('EXECUTE.STEP.NO_RESPONSE_BODY');
    }
    return response;
  }

  localizeRequestBody(request: string) {
    if (request === '{}' || request === '') {
      return this.translateService.instant('EXECUTE.STEP.NO_REQUEST_BODY');
    }
    return request;
  }

  localizeResults(results: IScenarioExecutionResult[]) {
    results.forEach((res) => {
      res.requestBody = this.localizeRequestBody(res.requestBody);
      res.response = this.localizeResponseBody(res.response);
    });
  }

  async downloadClick() {
    var results = this.results;
    this.localizeResults(results);

    const blob = this.fileService.getBlob(this.results);
    const filename =
      formatDate(new Date(), 'yyyy-MM-dd-HH-mm-ss', 'en_US') + '.csv';

    if (navigator.msSaveBlob) {
      // In case of IE 10+
      navigator.msSaveBlob(blob, filename);
    } else {
      const link = document.createElement('a');
      const url = window.URL.createObjectURL(blob);
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  clearClick() {
    this.executionResultService.clearResults();
  }
}
