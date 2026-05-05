'use client'

import { User, Shield, Trophy, Bell, HelpCircle, LogOut, ChevronRight, Moon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { useState } from 'react'

interface MenuItem {
  icon: typeof User
  label: string
  value?: string
  action?: () => void
  toggle?: boolean
}

export function MobileProfileView() {
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Edit Profile' },
        { icon: Bell, label: 'Notifications', toggle: true },
        { icon: Moon, label: 'Dark Mode', toggle: true },
      ]
    },
    {
      title: 'Stats',
      items: [
        { icon: Shield, label: 'Scams Blocked', value: '23' },
        { icon: Trophy, label: 'Challenge Score', value: '85%' },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help Center' },
        { icon: LogOut, label: 'Sign Out' },
      ]
    }
  ]

  return (
    <div className="flex flex-col gap-6 p-4 pb-24">
      {/* Profile Header */}
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
          <User className="w-10 h-10 text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">Guest User</h2>
          <p className="text-sm text-muted-foreground">scam-immunity@trustlens.ai</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Protected</span>
        </div>
      </div>

      {/* Menu Sections */}
      {menuSections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground px-1">{section.title}</h3>
          <Card className="border-border/50">
            <CardContent className="p-0 divide-y divide-border/50">
              {section.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-foreground">{item.label}</span>
                  </div>
                  {item.toggle ? (
                    <Switch 
                      checked={item.label === 'Notifications' ? notifications : darkMode}
                      onCheckedChange={(checked) => {
                        if (item.label === 'Notifications') {
                          setNotifications(checked)
                        } else if (item.label === 'Dark Mode') {
                          setDarkMode(checked)
                        }
                      }}
                    />
                  ) : item.value ? (
                    <span className="text-sm font-medium text-primary">{item.value}</span>
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ))}

      {/* Version Info */}
      <p className="text-center text-xs text-muted-foreground">
        TrustLens AI v1.0.0
      </p>
    </div>
  )
}
