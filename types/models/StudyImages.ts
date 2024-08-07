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

export class StudyImages {
  /**
   * Ex: https://static.quantimo.do/img/variable_categories/sleeping_in_bed-96.png
   */
  "causeVariableImageUrl"?: string
  /**
   * Ex: ion-ios-cloudy-night-outline
   */
  "causeVariableIonIcon"?: string
  /**
   * Ex: https://static.quantimo.do/img/variable_categories/theatre_mask-96.png
   */
  "effectVariableImageUrl"?: string
  /**
   * Ex: ion-happy-outline
   */
  "effectVariableIonIcon"?: string
  /**
   * Ex: https://s3.amazonaws.com/curedao-docs/images/gauge-moderately-positive-relationship.png
   */
  "gaugeImage": string
  /**
   * Ex: https://s3.amazonaws.com/curedao-docs/images/gauge-moderately-positive-relationship-200-200.png
   */
  "gaugeImageSquare": string
  /**
   * Image with gauge and category images
   */
  "gaugeSharingImageUrl"?: string
  /**
   * Ex: https://s3-us-west-1.amazonaws.com/qmimages/variable_categories_gauges_logo_background/gauge-moderately-positive-relationship_sleep_emotions_logo_background.png
   */
  "imageUrl": string
  /**
   * Image with robot and category images
   */
  "robotSharingImageUrl"?: string
  /**
   * Avatar of the principal investigator
   */
  "avatar"?: string

  static readonly discriminator: string | undefined = undefined

  static readonly attributeTypeMap: Array<{
    name: string
    baseName: string
    type: string
    format: string
  }> = [
    {
      name: "causeVariableImageUrl",
      baseName: "causeVariableImageUrl",
      type: "string",
      format: "",
    },
    {
      name: "causeVariableIonIcon",
      baseName: "causeVariableIonIcon",
      type: "string",
      format: "",
    },
    {
      name: "effectVariableImageUrl",
      baseName: "effectVariableImageUrl",
      type: "string",
      format: "",
    },
    {
      name: "effectVariableIonIcon",
      baseName: "effectVariableIonIcon",
      type: "string",
      format: "",
    },
    {
      name: "gaugeImage",
      baseName: "gaugeImage",
      type: "string",
      format: "",
    },
    {
      name: "gaugeImageSquare",
      baseName: "gaugeImageSquare",
      type: "string",
      format: "",
    },
    {
      name: "gaugeSharingImageUrl",
      baseName: "gaugeSharingImageUrl",
      type: "string",
      format: "",
    },
    {
      name: "imageUrl",
      baseName: "imageUrl",
      type: "string",
      format: "",
    },
    {
      name: "robotSharingImageUrl",
      baseName: "robotSharingImageUrl",
      type: "string",
      format: "",
    },
    {
      name: "avatar",
      baseName: "avatar",
      type: "string",
      format: "",
    },
  ]

  static getAttributeTypeMap() {
    return StudyImages.attributeTypeMap
  }

  public constructor() {}
}
