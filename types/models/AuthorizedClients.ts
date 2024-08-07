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

import { AppSettings } from "../models/AppSettings"

export class AuthorizedClients {
  /**
   * Applications with access to user measurements for all variables
   */
  "apps": Array<AppSettings>
  /**
   * Individuals such as physicians or family members with access to user measurements for all variables
   */
  "individuals": Array<AppSettings>
  /**
   * Studies with access to generally anonymous user measurements for a specific predictor and outcome variable
   */
  "studies": Array<AppSettings>

  static readonly discriminator: string | undefined = undefined

  static readonly attributeTypeMap: Array<{
    name: string
    baseName: string
    type: string
    format: string
  }> = [
    {
      name: "apps",
      baseName: "apps",
      type: "Array<AppSettings>",
      format: "",
    },
    {
      name: "individuals",
      baseName: "individuals",
      type: "Array<AppSettings>",
      format: "",
    },
    {
      name: "studies",
      baseName: "studies",
      type: "Array<AppSettings>",
      format: "",
    },
  ]

  static getAttributeTypeMap() {
    return AuthorizedClients.attributeTypeMap
  }

  public constructor() {}
}
