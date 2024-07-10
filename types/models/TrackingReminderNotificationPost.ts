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

export class TrackingReminderNotificationPost {
  /**
   * track records a measurement for the notification.  snooze changes the notification to 1 hour from now. skip deletes the notification.
   */
  "action": TrackingReminderNotificationPostActionEnum
  /**
   * Id of the TrackingReminderNotification
   */
  "id": number
  /**
   * Optional value to be recorded instead of the tracking reminder default value
   */
  "modifiedValue"?: number

  static readonly discriminator: string | undefined = undefined

  static readonly attributeTypeMap: Array<{
    name: string
    baseName: string
    type: string
    format: string
  }> = [
    {
      name: "action",
      baseName: "action",
      type: "TrackingReminderNotificationPostActionEnum",
      format: "",
    },
    {
      name: "id",
      baseName: "id",
      type: "number",
      format: "",
    },
    {
      name: "modifiedValue",
      baseName: "modifiedValue",
      type: "number",
      format: "",
    },
  ]

  static getAttributeTypeMap() {
    return TrackingReminderNotificationPost.attributeTypeMap
  }

  public constructor() {}
}

export type TrackingReminderNotificationPostActionEnum =
  | "skip"
  | "snooze"
  | "track"