import {getUserWishingWells} from "@/lib/api/wishingWells"
import {
  getWishingWellCountByDate,
  getDailyAverage,
  getWishingWellContributions,
  getMostContributedWishingWell,
  getStreak,
  getTopWishingWells,
  getTotalWishingWellContributions,
} from "@/lib/api/wishingWellContributions"
import {getAverageWarPercentageDesired} from "@/lib/api/poll";

type DateRangeType = {
  from: Date
  to: Date
}

export async function getDashboardData(
  userId: string,
  dateRange: DateRangeType
) {
  const [
    wishingWellContributions,
    streak,
    totalWishingWellContributions,
    mostContributedWishingWell,
    wishingWellCountByDate,
    topWishingWells,
    userWishingWells,
    averageWarPercentageDesired
  ] = await Promise.all([
    getWishingWellContributions(userId, dateRange, "user"),
    getStreak(userId, "user"),
    getTotalWishingWellContributions(userId, dateRange, "user"),
    getMostContributedWishingWell(userId, dateRange),
    getWishingWellCountByDate(userId, dateRange),
    getTopWishingWells(userId, dateRange),
    getUserWishingWells(userId),
    getAverageWarPercentageDesired()
  ])

  return {
    wishingWellContributions,
    streak,
    totalWishingWellContributions,
    mostContributedWishingWell,
    wishingWellCountByDate,
    topWishingWells,
    userWishingWells,
    averageWarPercentageDesired
  }
}

export async function getStatsDashboardData(
  wishingWellId: string,
  dateRange: DateRangeType
) {
  const [wishingWellContributions, streak, totalWishingWellContributions, dailyAverage] = await Promise.all([
    getWishingWellContributions(wishingWellId, dateRange, "wishingWell"),
    getStreak(wishingWellId, "wishingWell"),
    getTotalWishingWellContributions(wishingWellId, dateRange, "wishingWell"),
    getDailyAverage(wishingWellId, dateRange),
  ])

  return {
    wishingWellContributions,
    streak,
    totalWishingWellContributions,
    dailyAverage,
  }
}
