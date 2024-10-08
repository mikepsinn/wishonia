'use client'
export const maxDuration = 60;

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react' // Import useSession from next-auth
import ArticleRenderer from '@/components/ArticleRenderer'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArticleWithRelations } from '@/lib/agents/researcher/researcher'
import GlobalBrainNetwork from "@/components/landingPage/global-brain-network"
import { findOrCreateArticleByTopic } from "@/app/researcher/researcherActions";
import { UserAuthForm } from '@/components/user/user-auth-form'
import ArticleSearchAndGrid from '@/components/article/ArticleSearchAndGrid';

export default function ResearcherPage() {
    const { data: session, status } = useSession() 
    const loading = status === "loading"
    const router = useRouter()
    const searchParams = useSearchParams()

    const [article, setArticle] = useState<ArticleWithRelations | null>(null)
    const [error, setError] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [topic, setTopic] = useState('')


    useEffect(() => {
        const queryTopic = searchParams?.get('q')
        if (queryTopic) {
            setTopic(queryTopic)
            handleSubmit(queryTopic)
        }
    }, [searchParams])

    async function handleSubmit(submittedTopic: string) {

        if (!session?.user?.id) {
            return <UserAuthForm />
        }

        if (!submittedTopic) {
            setError('Please enter a topic')
            return
        }

        setIsGenerating(true)
        setError('')

        try {
            const generatedArticle = await findOrCreateArticleByTopic(submittedTopic, session?.user?.id)
            setArticle(generatedArticle)
            router.push(`?q=${encodeURIComponent(submittedTopic)}`, { scroll: false })
        } catch (err) {
            setError('Failed to generate article. Please try again.')
        } finally {
            setIsGenerating(false)
        }
    }

    if (loading) {
        return <div>Loading...</div>
    }

    if (!session?.user?.id) {
        return <UserAuthForm />
    }

    return (
        <main className="container mx-auto p-4">
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Autonomous Research Agent</CardTitle>
                    <CardDescription>
                        Enter a topic for me to research and I'll write an article with sources!
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        handleSubmit(topic)
                    }} className="flex gap-4">
                        <Input 
                            type="text" 
                            value={topic} 
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Enter article topic" 
                            className="flex-grow" 
                        />
                        <Button type="submit" disabled={isGenerating}>
                            {isGenerating ? 'Researching...' : 'Start Researching'}
                        </Button>
                    </form>
                </CardContent>
                {error && (
                    <CardFooter>
                        <p className="text-red-500">{error}</p>
                    </CardFooter>
                )}
            </Card>
            {isGenerating && (
                <div className="w-4/5 max-w-[600px] h-[600px] mx-auto">
                    <GlobalBrainNetwork />
                </div>
            )}
            {!isGenerating && article && <ArticleRenderer article={article} currentUserId={session?.user?.id}  />}
            <ArticleSearchAndGrid />
        </main>
    )
}