export interface TraversalVisitor {
    [key: string]: boolean;
}

export type ExtraType =
    | { [key: string]: string | number | null | undefined | boolean }
    | undefined
    | null;

export interface IReportMetricsParams {
    taskName: string;
    waitTimeCost: number | string;
    executeTimeCost: number | string;
}

export interface ICodeLogErrorParams {
    tag: string;
    message: string;
    extra?: ExtraType;
}

export interface IReportTargetToCatParams {
    taskName: string;
    value: number;
    errorCode: any;
}

export type TReportTaskMetrics = (params: IReportMetricsParams) => void | Promise<void>;

export type TCodeLogError = (params: ICodeLogErrorParams) => void | Promise<void>;

export type TReportTargetToCat = (params: IReportTargetToCatParams) => void | Promise<void>;

export interface IMPAnchorsInitParams {
    reportTaskMetrics?: TReportTaskMetrics;
    reportTargetToCat?: TReportTargetToCat;
    codeLogError?: TCodeLogError;
}

