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

import { Card } from "../models/Card"

export class User {
  /**
   * User access token
   */
  "accessToken": string
  /**
   * Ex: 2018-08-08 02:41:19
   */
  "accessTokenExpires"?: string
  /**
   * Ex: 1533696079000
   */
  "accessTokenExpiresAtMilliseconds"?: number
  /**
   * Is user administrator
   */
  "administrator": boolean
  /**
   * Ex: https://lh6.googleusercontent.com/-BHr4hyUWqZU/AAAAAAAAAAI/AAAAAAAIG28/2Lv0en738II/photo.jpg?sz=50
   */
  "avatar"?: string
  /**
   * Ex: https://lh6.googleusercontent.com/-BHr4hyUWqZU/AAAAAAAAAAI/AAAAAAAIG28/2Lv0en738II/photo.jpg?sz=50
   */
  "avatarImage"?: string
  /**
   * Ex: a:1:{s:13:\"administrator\";b:1;}
   */
  "capabilities"?: string
  "card"?: Card
  /**
   * Ex: curedao
   */
  "clientId"?: string
  /**
   * Ex: 118444693184829555362
   */
  "clientUserId"?: string
  /**
   * Ex: 1
   */
  "combineNotifications"?: boolean
  /**
   * When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format
   */
  "createdAt"?: string
  /**
   * Your bio will be displayed on your published studies
   */
  "description"?: string
  /**
   * User display name
   */
  "displayName": string
  /**
   * Earliest time user should get notifications. Ex: 05:00:00
   */
  "earliestReminderTime"?: string
  /**
   * User email
   */
  "email": string
  /**
   * Ex: Mike
   */
  "firstName"?: string
  /**
   * Ex: false
   */
  "getPreviewBuilds"?: boolean
  /**
   * Ex: false
   */
  "hasAndroidApp"?: boolean
  /**
   * Ex: false
   */
  "hasChromeExtension"?: boolean
  /**
   * Ex: false
   */
  "hasIosApp"?: boolean
  /**
   * User id
   */
  "id": number
  /**
   * Ex: Date the user last logged in
   */
  "lastActive"?: string
  /**
   * Ex: 2009
   */
  "lastFour"?: string
  /**
   * Ex: Sinn
   */
  "lastName"?: string
  /**
   * Ex: 1
   */
  "lastSmsTrackingReminderNotificationId"?: string
  /**
   * Latest time user should get notifications. Ex: 23:00:00
   */
  "latestReminderTime"?: string
  /**
   * User login name
   */
  "loginName": string
  /**
   * Ex: PASSWORD
   */
  "password"?: string
  /**
   * Ex: 618-391-0002
   */
  "phoneNumber"?: string
  /**
   * Ex: 1234
   */
  "phoneVerificationCode"?: string
  /**
   * A good primary outcome variable is something that you want to improve and that changes inexplicably. For instance, if you have anxiety, back pain or arthritis which is worse on some days than others, these would be good candidates for primary outcome variables.  Recording their severity and potential factors will help you identify hidden factors exacerbating or improving them.
   */
  "primaryOutcomeVariableId"?: number
  /**
   * A good primary outcome variable is something that you want to improve and that changes inexplicably. For instance, if you have anxiety, back pain or arthritis which is worse on some days than others, these would be good candidates for primary outcome variables.  Recording their severity and potential factors will help you identify hidden factors exacerbating or improving them.
   */
  "primaryOutcomeVariableName"?: string
  /**
   * Ex: 1
   */
  "pushNotificationsEnabled"?: boolean
  /**
   * See https://oauth.net/2/grant-types/refresh-token/
   */
  "refreshToken"?: string
  /**
   * Ex: [\"admin\"]
   */
  "roles"?: string
  /**
   * Ex: 1
   */
  "sendPredictorEmails"?: boolean
  /**
   * Ex: 1
   */
  "sendReminderNotificationEmails"?: boolean
  /**
   * Share all studies, charts, and measurement data with all other users
   */
  "shareAllData"?: boolean
  /**
   * Ex: false
   */
  "smsNotificationsEnabled"?: boolean
  /**
   * Ex: 1
   */
  "stripeActive"?: boolean
  /**
   * Ex: cus_A8CEmcvl8jwLhV
   */
  "stripeId"?: string
  /**
   * Ex: monthly7
   */
  "stripePlan"?: string
  /**
   * Ex: sub_ANTx3nOE7nzjQf
   */
  "stripeSubscription"?: string
  /**
   * UTC ISO 8601 YYYY-MM-DDThh:mm:ss
   */
  "subscriptionEndsAt"?: string
  /**
   * Ex: google
   */
  "subscriptionProvider"?: string
  /**
   * Ex: 300
   */
  "timeZoneOffset"?: number
  /**
   * Ex: 1
   */
  "trackLocation"?: boolean
  /**
   * When the record in the database was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format
   */
  "updatedAt"?: string
  /**
   * Ex: 2013-12-03 15:25:13 UTC ISO 8601 YYYY-MM-DDThh:mm:ss
   */
  "userRegistered"?: string
  /**
   * Ex: https://plus.google.com/+MikeSinn
   */
  "userUrl"?: string

  static readonly discriminator: string | undefined = undefined

  static readonly attributeTypeMap: Array<{
    name: string
    baseName: string
    type: string
    format: string
  }> = [
    {
      name: "accessToken",
      baseName: "accessToken",
      type: "string",
      format: "",
    },
    {
      name: "accessTokenExpires",
      baseName: "accessTokenExpires",
      type: "string",
      format: "",
    },
    {
      name: "accessTokenExpiresAtMilliseconds",
      baseName: "accessTokenExpiresAtMilliseconds",
      type: "number",
      format: "",
    },
    {
      name: "administrator",
      baseName: "administrator",
      type: "boolean",
      format: "",
    },
    {
      name: "avatar",
      baseName: "avatar",
      type: "string",
      format: "",
    },
    {
      name: "avatarImage",
      baseName: "avatarImage",
      type: "string",
      format: "",
    },
    {
      name: "capabilities",
      baseName: "capabilities",
      type: "string",
      format: "",
    },
    {
      name: "card",
      baseName: "card",
      type: "Card",
      format: "",
    },
    {
      name: "clientId",
      baseName: "clientId",
      type: "string",
      format: "",
    },
    {
      name: "clientUserId",
      baseName: "clientUserId",
      type: "string",
      format: "",
    },
    {
      name: "combineNotifications",
      baseName: "combineNotifications",
      type: "boolean",
      format: "",
    },
    {
      name: "createdAt",
      baseName: "createdAt",
      type: "string",
      format: "",
    },
    {
      name: "description",
      baseName: "description",
      type: "string",
      format: "",
    },
    {
      name: "displayName",
      baseName: "displayName",
      type: "string",
      format: "",
    },
    {
      name: "earliestReminderTime",
      baseName: "earliestReminderTime",
      type: "string",
      format: "",
    },
    {
      name: "email",
      baseName: "email",
      type: "string",
      format: "",
    },
    {
      name: "firstName",
      baseName: "firstName",
      type: "string",
      format: "",
    },
    {
      name: "getPreviewBuilds",
      baseName: "getPreviewBuilds",
      type: "boolean",
      format: "",
    },
    {
      name: "hasAndroidApp",
      baseName: "hasAndroidApp",
      type: "boolean",
      format: "",
    },
    {
      name: "hasChromeExtension",
      baseName: "hasChromeExtension",
      type: "boolean",
      format: "",
    },
    {
      name: "hasIosApp",
      baseName: "hasIosApp",
      type: "boolean",
      format: "",
    },
    {
      name: "id",
      baseName: "id",
      type: "number",
      format: "",
    },
    {
      name: "lastActive",
      baseName: "lastActive",
      type: "string",
      format: "",
    },
    {
      name: "lastFour",
      baseName: "lastFour",
      type: "string",
      format: "",
    },
    {
      name: "lastName",
      baseName: "lastName",
      type: "string",
      format: "",
    },
    {
      name: "lastSmsTrackingReminderNotificationId",
      baseName: "lastSmsTrackingReminderNotificationId",
      type: "string",
      format: "",
    },
    {
      name: "latestReminderTime",
      baseName: "latestReminderTime",
      type: "string",
      format: "",
    },
    {
      name: "loginName",
      baseName: "loginName",
      type: "string",
      format: "",
    },
    {
      name: "password",
      baseName: "password",
      type: "string",
      format: "",
    },
    {
      name: "phoneNumber",
      baseName: "phoneNumber",
      type: "string",
      format: "",
    },
    {
      name: "phoneVerificationCode",
      baseName: "phoneVerificationCode",
      type: "string",
      format: "",
    },
    {
      name: "primaryOutcomeVariableId",
      baseName: "primaryOutcomeVariableId",
      type: "number",
      format: "",
    },
    {
      name: "primaryOutcomeVariableName",
      baseName: "primaryOutcomeVariableName",
      type: "string",
      format: "",
    },
    {
      name: "pushNotificationsEnabled",
      baseName: "pushNotificationsEnabled",
      type: "boolean",
      format: "",
    },
    {
      name: "refreshToken",
      baseName: "refreshToken",
      type: "string",
      format: "",
    },
    {
      name: "roles",
      baseName: "roles",
      type: "string",
      format: "",
    },
    {
      name: "sendPredictorEmails",
      baseName: "sendPredictorEmails",
      type: "boolean",
      format: "",
    },
    {
      name: "sendReminderNotificationEmails",
      baseName: "sendReminderNotificationEmails",
      type: "boolean",
      format: "",
    },
    {
      name: "shareAllData",
      baseName: "shareAllData",
      type: "boolean",
      format: "",
    },
    {
      name: "smsNotificationsEnabled",
      baseName: "smsNotificationsEnabled",
      type: "boolean",
      format: "",
    },
    {
      name: "stripeActive",
      baseName: "stripeActive",
      type: "boolean",
      format: "",
    },
    {
      name: "stripeId",
      baseName: "stripeId",
      type: "string",
      format: "",
    },
    {
      name: "stripePlan",
      baseName: "stripePlan",
      type: "string",
      format: "",
    },
    {
      name: "stripeSubscription",
      baseName: "stripeSubscription",
      type: "string",
      format: "",
    },
    {
      name: "subscriptionEndsAt",
      baseName: "subscriptionEndsAt",
      type: "string",
      format: "",
    },
    {
      name: "subscriptionProvider",
      baseName: "subscriptionProvider",
      type: "string",
      format: "",
    },
    {
      name: "timeZoneOffset",
      baseName: "timeZoneOffset",
      type: "number",
      format: "",
    },
    {
      name: "trackLocation",
      baseName: "trackLocation",
      type: "boolean",
      format: "",
    },
    {
      name: "updatedAt",
      baseName: "updatedAt",
      type: "string",
      format: "",
    },
    {
      name: "userRegistered",
      baseName: "userRegistered",
      type: "string",
      format: "",
    },
    {
      name: "userUrl",
      baseName: "userUrl",
      type: "string",
      format: "",
    },
  ]

  static getAttributeTypeMap() {
    return User.attributeTypeMap
  }

  public constructor() {}
}
