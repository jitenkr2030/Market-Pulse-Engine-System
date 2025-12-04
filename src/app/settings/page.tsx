"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette, 
  Monitor,
  Moon,
  Sun,
  Mail,
  Smartphone,
  Database,
  Trash2,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const preferencesSchema = z.object({
  theme: z.enum(["light", "dark", "auto"]),
  timeFrame: z.enum(["1m", "5m", "15m", "1h", "4h", "1d"]),
  refreshInterval: z.number().min(5).max(300),
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  alertEmail: z.boolean(),
  alertPush: z.boolean(),
  alertSms: z.boolean(),
  dataRetention: z.enum(["30", "90", "180", "365"]),
  autoExport: z.boolean(),
  exportFormat: z.enum(["csv", "json", "xlsx"]),
})

type PreferencesFormData = z.infer<typeof preferencesSchema>

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [activeTab, setActiveTab] = useState("general")

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      theme: "auto",
      timeFrame: "1h",
      refreshInterval: 30,
      emailNotifications: true,
      pushNotifications: true,
      alertEmail: true,
      alertPush: true,
      alertSms: false,
      dataRetention: "90",
      autoExport: false,
      exportFormat: "csv",
    },
  })

  const watchedTheme = watch("theme")

  const onSubmit = async (data: PreferencesFormData) => {
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setMessage({ type: "error", text: result.message || "Failed to update preferences" })
      } else {
        setMessage({ type: "success", text: "Preferences updated successfully" })
        // Apply theme change immediately
        if (data.theme === "dark") {
          document.documentElement.classList.add("dark")
        } else if (data.theme === "light") {
          document.documentElement.classList.remove("dark")
        } else {
          // Auto theme based on system preference
          const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
          if (isDark) {
            document.documentElement.classList.add("dark")
          } else {
            document.documentElement.classList.remove("dark")
          }
        }
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      const response = await fetch("/api/user/export", {
        method: "GET",
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `market-pulse-data-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        setMessage({ type: "success", text: "Data exported successfully" })
      } else {
        setMessage({ type: "error", text: "Failed to export data" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred while exporting data" })
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch("/api/user/account", {
        method: "DELETE",
      })

      if (response.ok) {
        setMessage({ type: "success", text: "Account deleted successfully" })
        setTimeout(() => {
          router.push("/")
        }, 2000)
      } else {
        setMessage({ type: "error", text: "Failed to delete account" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred while deleting account" })
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Authentication Required</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Please sign in to access your settings.
            </p>
            <Button onClick={() => router.push("/auth/signin")} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account preferences and configuration
            </p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>

        {/* Message Alert */}
        {message && (
          <Alert className={message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="danger">Danger Zone</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>General Preferences</span>
                </CardTitle>
                <CardDescription>
                  Customize your dashboard and general application settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Theme Settings */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Theme</Label>
                      <p className="text-sm text-muted-foreground">
                        Choose how the application looks
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: "light", label: "Light", icon: Sun },
                        { value: "dark", label: "Dark", icon: Moon },
                        { value: "auto", label: "Auto", icon: Monitor },
                      ].map((theme) => {
                        const Icon = theme.icon
                        return (
                          <Card
                            key={theme.value}
                            className={`cursor-pointer transition-all ${
                              watchedTheme === theme.value
                                ? "ring-2 ring-primary border-primary"
                                : "hover:shadow-md"
                            }`}
                            onClick={() => setValue("theme", theme.value as any)}
                          >
                            <CardContent className="p-4 text-center">
                              <Icon className="h-8 w-8 mx-auto mb-2" />
                              <p className="font-medium">{theme.label}</p>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>

                  <Separator />

                  {/* Dashboard Settings */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Dashboard Settings</Label>
                      <p className="text-sm text-muted-foreground">
                        Configure your dashboard behavior
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="timeFrame">Default Time Frame</Label>
                        <Select onValueChange={(value) => setValue("timeFrame", value as any)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time frame" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1m">1 Minute</SelectItem>
                            <SelectItem value="5m">5 Minutes</SelectItem>
                            <SelectItem value="15m">15 Minutes</SelectItem>
                            <SelectItem value="1h">1 Hour</SelectItem>
                            <SelectItem value="4h">4 Hours</SelectItem>
                            <SelectItem value="1d">1 Day</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="refreshInterval">Refresh Interval (seconds)</Label>
                        <Input
                          id="refreshInterval"
                          type="number"
                          min="5"
                          max="300"
                          {...register("refreshInterval", { valueAsNumber: true })}
                        />
                        {errors.refreshInterval && (
                          <p className="text-sm text-red-500">{errors.refreshInterval.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
                <CardDescription>
                  Manage how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* General Notifications */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">General Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Choose which types of notifications you want to receive
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium">Email Notifications</Label>
                          <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                        </div>
                        <Switch
                          checked={watch("emailNotifications")}
                          onCheckedChange={(checked) => setValue("emailNotifications", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium">Push Notifications</Label>
                          <p className="text-xs text-muted-foreground">Receive push notifications in browser</p>
                        </div>
                        <Switch
                          checked={watch("pushNotifications")}
                          onCheckedChange={(checked) => setValue("pushNotifications", checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Alert Notifications */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Alert Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Configure how you want to receive alert notifications
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <span>Email Alerts</span>
                          </Label>
                          <p className="text-xs text-muted-foreground">Send alerts to your email</p>
                        </div>
                        <Switch
                          checked={watch("alertEmail")}
                          onCheckedChange={(checked) => setValue("alertEmail", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium flex items-center space-x-2">
                            <Smartphone className="h-4 w-4" />
                            <span>Push Alerts</span>
                          </Label>
                          <p className="text-xs text-muted-foreground">Send alerts as push notifications</p>
                        </div>
                        <Switch
                          checked={watch("alertPush")}
                          onCheckedChange={(checked) => setValue("alertPush", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium flex items-center space-x-2">
                            <span>📱</span>
                            <span>SMS Alerts</span>
                          </Label>
                          <p className="text-xs text-muted-foreground">Send alerts via SMS (premium feature)</p>
                        </div>
                        <Switch
                          checked={watch("alertSms")}
                          onCheckedChange={(checked) => setValue("alertSms", checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Privacy & Data</span>
                </CardTitle>
                <CardDescription>
                  Manage your data privacy and export options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Data Management */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Data Management</Label>
                      <p className="text-sm text-muted-foreground">
                        Control how your data is stored and managed
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dataRetention">Data Retention Period</Label>
                        <Select onValueChange={(value) => setValue("dataRetention", value as any)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select retention period" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 Days</SelectItem>
                            <SelectItem value="90">90 Days</SelectItem>
                            <SelectItem value="180">180 Days</SelectItem>
                            <SelectItem value="365">1 Year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="exportFormat">Default Export Format</Label>
                        <Select onValueChange={(value) => setValue("exportFormat", value as any)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select export format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="csv">CSV</SelectItem>
                            <SelectItem value="json">JSON</SelectItem>
                            <SelectItem value="xlsx">Excel</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Auto Export Data</Label>
                        <p className="text-xs text-muted-foreground">Automatically export data periodically</p>
                      </div>
                      <Switch
                        checked={watch("autoExport")}
                        onCheckedChange={(checked) => setValue("autoExport", checked)}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Data Actions */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Data Actions</Label>
                      <p className="text-sm text-muted-foreground">
                        Export or manage your personal data
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleExportData}
                        className="flex items-center space-x-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>Export My Data</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex items-center space-x-2"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Import Data</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex items-center space-x-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span>Sync Data</span>
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Danger Zone */}
          <TabsContent value="danger">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span>Danger Zone</span>
                </CardTitle>
                <CardDescription>
                  These actions are irreversible. Please proceed with caution.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Delete Account */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium text-red-600">Delete Account</Label>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-red-800">Warning:</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• This action cannot be undone</li>
                        <li>• All your data will be permanently deleted</li>
                        <li>• Your subscription will be cancelled</li>
                        <li>• You will lose access to all features</li>
                      </ul>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    className="flex items-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Account</span>
                  </Button>
                </div>

                <Separator />

                {/* Reset Data */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Reset All Data</Label>
                    <p className="text-sm text-muted-foreground">
                      Reset all your preferences, watchlists, and alerts to default settings
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Reset All Data</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}