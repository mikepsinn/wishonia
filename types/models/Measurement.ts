/**
 * Decentralized FDA API
 * A platform for quantifying the effects of every drug, supplement, food, and other factor on your health.
 *
 * OpenAPI spec version: 0.0.1
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { Card } from '../models/Card';


export class Measurement {
    'card'?: Card;
    /**
    * Ex: curedao
    */
    'clientId'?: string;
    /**
    * Ex: 13
    */
    'connectorId'?: number;
    /**
    * Ex: 2017-07-30 21:08:36
    */
    'createdAt'?: string;
    /**
    * Examples: 3/5, $10, or 1 count
    */
    'displayValueAndUnitString'?: string;
    /**
    * Ex: ion-sad-outline
    */
    'iconIcon'?: string;
    /**
    * Ex: 1051466127
    */
    'id'?: number;
    /**
    * Ex: value
    */
    'inputType'?: string;
    /**
    * Ex: ion-ios-medkit-outline
    */
    'ionIcon'?: string;
    /**
    * Ex: 1
    */
    'manualTracking'?: boolean;
    /**
    * Ex: 5. Unit: User-specified or common.
    */
    'maximumAllowedValue'?: number;
    /**
    * Ex: 1. Unit: User-specified or common.
    */
    'minimumAllowedValue'?: number;
    /**
    * Note of measurement
    */
    'note'?: string;
    /**
    * Additional meta data for the measurement
    */
    'noteObject'?: any;
    /**
    * Embeddable HTML with message hyperlinked with associated url
    */
    'noteHtml'?: any;
    /**
    * Ex: 23
    */
    'originalUnitId'?: number;
    /**
    * Original value submitted. Unit: Originally submitted.
    */
    'originalValue'?: number;
    /**
    * Ex: img/variable_categories/treatments.png
    */
    'pngPath'?: string;
    /**
    * Ex: https://safe.dfda.earth/img/variable_categories/treatments.png
    */
    'pngUrl'?: string;
    /**
    * Link to associated product for purchase
    */
    'productUrl'?: string;
    /**
    * Application or device used to record the measurement values
    */
    'sourceName': string;
    /**
    * Ex: 2014-08-27
    */
    'startDate'?: string;
    /**
    * Start Time for the measurement event in UTC ISO 8601 YYYY-MM-DDThh:mm:ss
    */
    'startAt': string;
    /**
    * Ex: https://safe.dfda.earth/img/variable_categories/treatments.svg
    */
    'svgUrl'?: string;
    /**
    * Abbreviated name for the unit of measurement
    */
    'unitAbbreviatedName': string;
    /**
    * Ex: 6
    */
    'unitCategoryId'?: number;
    /**
    * Ex: Miscellany
    */
    'unitCategoryName'?: string;
    /**
    * Ex: 23
    */
    'unitId'?: number;
    /**
    * Ex: Count
    */
    'unitName'?: string;
    /**
    * Ex: 2017-07-30 21:08:36
    */
    'updatedAt'?: string;
    /**
    * Link to associated Facebook like or GitHub commit, for instance
    */
    'url'?: string;
    /**
    * Ex: count
    */
    'userVariableUnitAbbreviatedName'?: string;
    /**
    * Ex: 6
    */
    'userVariableUnitCategoryId'?: number;
    /**
    * Ex: Miscellany
    */
    'userVariableUnitCategoryName'?: string;
    /**
    * Ex: 23
    */
    'userVariableUnitId'?: number;
    /**
    * Ex: Count
    */
    'userVariableUnitName'?: string;
    /**
    * Ex: 13
    */
    'userVariableVariableCategoryId'?: number;
    /**
    * Ex: Treatments
    */
    'userVariableVariableCategoryName'?: string;
    /**
    * Valence indicates what type of buttons should be used when recording measurements for this variable. positive - Face buttons with the happiest face equating to a 5/5 rating where higher is better like Overall Mood. negative - Face buttons with the happiest face equating to a 1/5 rating where lower is better like Headache Severity. numeric - Just 1 to 5 numeric buttons for neutral variables.
    */
    'valence'?: string;
    /**
    * Converted measurement value in requested unit
    */
    'value': number;
    /**
    * Ex: 13
    */
    'variableCategoryId'?: number;
    /**
    * Ex: https://static.quantimo.do/img/variable_categories/pill-96.png
    */
    'variableCategoryImageUrl'?: string;
    /**
    * Ex: Emotions, Treatments, Symptoms...
    */
    'variableCategoryName'?: MeasurementVariableCategoryNameEnum;
    /**
    * Valence indicates what type of buttons should be used when recording measurements for this variable. positive - Face buttons with the happiest face equating to a 5/5 rating where higher is better like Overall Mood. negative - Face buttons with the happiest face equating to a 1/5 rating where lower is better like Headache Severity. numeric - Just 1 to 5 numeric buttons for neutral variables.
    */
    'variableDescription'?: string;
    /**
    * Ex: 5956846
    */
    'variableId'?: number;
    /**
    * Name of the variable for which we are creating the measurement records
    */
    'variableName': string;
    /**
    * Ex: Trader Joe Bedtime Tea
    */
    'displayName'?: string;

    static readonly discriminator: string | undefined = undefined;

    static readonly attributeTypeMap: Array<{name: string, baseName: string, type: string, format: string}> = [
        {
            "name": "card",
            "baseName": "card",
            "type": "Card",
            "format": ""
        },
        {
            "name": "clientId",
            "baseName": "clientId",
            "type": "string",
            "format": ""
        },
        {
            "name": "connectorId",
            "baseName": "connectorId",
            "type": "number",
            "format": ""
        },
        {
            "name": "createdAt",
            "baseName": "createdAt",
            "type": "string",
            "format": ""
        },
        {
            "name": "displayValueAndUnitString",
            "baseName": "displayValueAndUnitString",
            "type": "string",
            "format": ""
        },
        {
            "name": "iconIcon",
            "baseName": "iconIcon",
            "type": "string",
            "format": ""
        },
        {
            "name": "id",
            "baseName": "id",
            "type": "number",
            "format": ""
        },
        {
            "name": "inputType",
            "baseName": "inputType",
            "type": "string",
            "format": ""
        },
        {
            "name": "ionIcon",
            "baseName": "ionIcon",
            "type": "string",
            "format": ""
        },
        {
            "name": "manualTracking",
            "baseName": "manualTracking",
            "type": "boolean",
            "format": ""
        },
        {
            "name": "maximumAllowedValue",
            "baseName": "maximumAllowedValue",
            "type": "number",
            "format": "double"
        },
        {
            "name": "minimumAllowedValue",
            "baseName": "minimumAllowedValue",
            "type": "number",
            "format": "double"
        },
        {
            "name": "note",
            "baseName": "note",
            "type": "string",
            "format": ""
        },
        {
            "name": "noteObject",
            "baseName": "noteObject",
            "type": "any",
            "format": ""
        },
        {
            "name": "noteHtml",
            "baseName": "noteHtml",
            "type": "any",
            "format": ""
        },
        {
            "name": "originalUnitId",
            "baseName": "originalUnitId",
            "type": "number",
            "format": ""
        },
        {
            "name": "originalValue",
            "baseName": "originalValue",
            "type": "number",
            "format": "double"
        },
        {
            "name": "pngPath",
            "baseName": "pngPath",
            "type": "string",
            "format": ""
        },
        {
            "name": "pngUrl",
            "baseName": "pngUrl",
            "type": "string",
            "format": ""
        },
        {
            "name": "productUrl",
            "baseName": "productUrl",
            "type": "string",
            "format": ""
        },
        {
            "name": "sourceName",
            "baseName": "sourceName",
            "type": "string",
            "format": ""
        },
        {
            "name": "startDate",
            "baseName": "startDate",
            "type": "string",
            "format": ""
        },
        {
            "name": "startAt",
            "baseName": "startAt",
            "type": "string",
            "format": ""
        },
        {
            "name": "svgUrl",
            "baseName": "svgUrl",
            "type": "string",
            "format": ""
        },
        {
            "name": "unitAbbreviatedName",
            "baseName": "unitAbbreviatedName",
            "type": "string",
            "format": ""
        },
        {
            "name": "unitCategoryId",
            "baseName": "unitCategoryId",
            "type": "number",
            "format": ""
        },
        {
            "name": "unitCategoryName",
            "baseName": "unitCategoryName",
            "type": "string",
            "format": ""
        },
        {
            "name": "unitId",
            "baseName": "unitId",
            "type": "number",
            "format": ""
        },
        {
            "name": "unitName",
            "baseName": "unitName",
            "type": "string",
            "format": ""
        },
        {
            "name": "updatedAt",
            "baseName": "updatedAt",
            "type": "string",
            "format": ""
        },
        {
            "name": "url",
            "baseName": "url",
            "type": "string",
            "format": ""
        },
        {
            "name": "userVariableUnitAbbreviatedName",
            "baseName": "userVariableUnitAbbreviatedName",
            "type": "string",
            "format": ""
        },
        {
            "name": "userVariableUnitCategoryId",
            "baseName": "userVariableUnitCategoryId",
            "type": "number",
            "format": ""
        },
        {
            "name": "userVariableUnitCategoryName",
            "baseName": "userVariableUnitCategoryName",
            "type": "string",
            "format": ""
        },
        {
            "name": "userVariableUnitId",
            "baseName": "userVariableUnitId",
            "type": "number",
            "format": ""
        },
        {
            "name": "userVariableUnitName",
            "baseName": "userVariableUnitName",
            "type": "string",
            "format": ""
        },
        {
            "name": "userVariableVariableCategoryId",
            "baseName": "userVariableVariableCategoryId",
            "type": "number",
            "format": ""
        },
        {
            "name": "userVariableVariableCategoryName",
            "baseName": "userVariableVariableCategoryName",
            "type": "string",
            "format": ""
        },
        {
            "name": "valence",
            "baseName": "valence",
            "type": "string",
            "format": ""
        },
        {
            "name": "value",
            "baseName": "value",
            "type": "number",
            "format": "double"
        },
        {
            "name": "variableCategoryId",
            "baseName": "variableCategoryId",
            "type": "number",
            "format": ""
        },
        {
            "name": "variableCategoryImageUrl",
            "baseName": "variableCategoryImageUrl",
            "type": "string",
            "format": ""
        },
        {
            "name": "variableCategoryName",
            "baseName": "variableCategoryName",
            "type": "MeasurementVariableCategoryNameEnum",
            "format": ""
        },
        {
            "name": "variableDescription",
            "baseName": "variableDescription",
            "type": "string",
            "format": ""
        },
        {
            "name": "variableId",
            "baseName": "variableId",
            "type": "number",
            "format": ""
        },
        {
            "name": "variableName",
            "baseName": "variableName",
            "type": "string",
            "format": ""
        },
        {
            "name": "displayName",
            "baseName": "displayName",
            "type": "string",
            "format": ""
        }    ];

    static getAttributeTypeMap() {
        return Measurement.attributeTypeMap;
    }

    public constructor() {
    }
}


export type MeasurementVariableCategoryNameEnum = "Activity" | "Books" | "Causes of Illness" | "Cognitive Performance" | "Conditions" | "Emotions" | "Environment" | "Foods" | "Goals" | "Locations" | "Miscellaneous" | "Movies and TV" | "Music" | "Nutrients" | "Payments" | "Physical Activities" | "Physique" | "Sleep" | "Social Interactions" | "Software" | "Symptoms" | "Treatments" | "Vital Signs" ;

