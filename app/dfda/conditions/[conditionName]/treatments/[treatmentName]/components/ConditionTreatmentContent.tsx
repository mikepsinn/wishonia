'use client'

import React, { useEffect, useState } from 'react'
import { getMetaAnalysis } from '@/app/dfda/dfdaActions'
import ArticleRenderer from '@/components/ArticleRenderer'
import { ArticleWithRelations } from '@/lib/agents/researcher/researcher'
import GlobalHealthOptimizationAgent from "@/components/landingPage/global-health-optimization-agent"

interface ConditionTreatmentContentProps {
    treatmentName: string
    conditionName: string
}

export function ConditionTreatmentContent({ treatmentName, conditionName }: ConditionTreatmentContentProps) {
    const [article, setArticle] = useState<ArticleWithRelations | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let isSubscribed = true
        async function fetchMetaAnalysis() {
            try {
                const metaAnalysis = await getMetaAnalysis(treatmentName, conditionName)
                if (isSubscribed) {
                    setArticle(metaAnalysis)
                }
            } catch (error) {
                if (isSubscribed) {
                    setArticle(null)
                    // Consider using a toast notification or error state
                    console.error('Error fetching meta-analysis:', error)
                }
            } finally {
                if (isSubscribed) {
                    setLoading(false)
                }
            }
        }

        fetchMetaAnalysis()
        return () => {
            isSubscribed = false
        }
    }, [treatmentName, conditionName])

    if (loading) {
        return <div>Loading...</div>
    }

    if (!article) {
        return <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">
                {treatmentName} for {conditionName}
            </h1>
            <p>No analysis available for this treatment and condition combination.</p>
        </div>
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">
                {treatmentName} for {conditionName}
            </h1>
            <ArticleRenderer article={article} />
            <div className="mt-8">
                <GlobalHealthOptimizationAgent />
            </div>
        </div>
    )
} 