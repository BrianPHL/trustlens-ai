'use client'

import { useState } from 'react'
import { 
  BookOpen, 
  Search, 
  ChevronRight, 
  ShieldCheck, 
  ShieldAlert, 
  HelpCircle,
  X,
  CheckCircle2,
  ArrowRight,
  Clock,
  Link2,
  KeyRound,
  Gift,
  UserX,
  CreditCard,
  Briefcase,
  HeartCrack,
  TrendingDown
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const ICON_MAP: Record<string, any> = {
  Clock,
  Link2,
  KeyRound,
  Gift,
  ShieldAlert,
  UserX,
  CreditCard,
  Briefcase,
  HeartCrack,
  TrendingDown
}
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { EDUCATION_CONTENT } from '@/lib/scam-analyzer'

export function MobileLearningView() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTopic, setSelectedTopic] = useState<any>(null)

  const filteredTopics = EDUCATION_CONTENT.filter(topic => 
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const checklist = [
    'Never share OTP, password, or PIN',
    "Don't click links in unsolicited messages",
    'Verify through official channels',
    'Be skeptical of urgency and threats'
  ]

  return (
    <div className="flex flex-col gap-6 p-5 pb-32 bg-[#F9FAFB] dark:bg-slate-950 min-h-screen font-geist transition-colors duration-300">
      
      {/* Search Header */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Learning Hub</h1>
          <p className="text-sm text-slate-500 font-medium">Protect yourself with expert security tips</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search scam types..." 
            className="pl-10 h-12 rounded-2xl bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTopics.map((topic) => (
          <motion.div
            key={topic.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedTopic(topic)}
          >
            <Card className="overflow-hidden border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  {(() => {
                    const Icon = ICON_MAP[topic.icon] || BookOpen
                    return <Icon className="w-6 h-6 text-primary" />
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white truncate">{topic.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{topic.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Safety Checklist Card */}
      <Card className="border-none bg-primary/5 dark:bg-primary/10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-8 -mt-8" />
        <CardContent className="p-6 space-y-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/20">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Safety Essentials</h3>
          </div>
          <div className="space-y-3">
            {checklist.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-tight font-medium">{item}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal Overlay */}
      <AnimatePresence>
        {selectedTopic && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setSelectedTopic(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    {(() => {
                      const Icon = ICON_MAP[selectedTopic.icon] || BookOpen
                      return <Icon className="w-7 h-7 text-primary" />
                    })()}
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setSelectedTopic(null)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{selectedTopic.title}</h2>
                  <p className="text-slate-500 font-medium leading-relaxed">{selectedTopic.description}</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Common Examples</h4>
                    <div className="space-y-2">
                      {selectedTopic.examples.map((ex: string, i: number) => (
                        <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-sm italic text-slate-600 dark:text-slate-400">
                          "{ex}"
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">What To Do</h4>
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50">
                      <p className="text-sm text-emerald-700 dark:text-emerald-400 font-bold leading-relaxed">
                        {selectedTopic.whatToDo}
                      </p>
                    </div>
                  </div>
                </div>

                <Button className="w-full h-14 rounded-2xl font-bold shadow-lg shadow-primary/20 gap-2" onClick={() => setSelectedTopic(null)}>
                  I got it!
                  <ShieldCheck className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
