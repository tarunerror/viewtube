"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"

const settingsFormSchema = z.object({
  autoplay: z.boolean().default(true),
  defaultQuality: z.enum(["auto", "1080p", "720p", "480p", "360p"]).default("auto"),
  enablePiP: z.boolean().default(true),
  saveHistory: z.boolean().default(true),
  darkMode: z.boolean().default(true),
})

type SettingsFormValues = z.infer<typeof settingsFormSchema>

const defaultValues: Partial<SettingsFormValues> = {
  autoplay: true,
  defaultQuality: "auto",
  enablePiP: true,
  saveHistory: true,
  darkMode: true,
}

export default function SettingsPage() {
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues,
  })

  function onSubmit(data: SettingsFormValues) {
    // Save settings to localStorage
    localStorage.setItem("viewtube-settings", JSON.stringify(data))
    toast({
      title: "Settings updated",
      description: "Your preferences have been saved.",
    })
  }

  return (
    <div className="container py-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Playback Settings</h2>
              <Separator />

              <FormField
                control={form.control}
                name="autoplay"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Autoplay</FormLabel>
                      <FormDescription>Automatically play the next video when the current one ends</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultQuality"
                render={({ field }) => (
                  <FormItem className="rounded-lg border p-4">
                    <FormLabel className="text-base">Default Quality</FormLabel>
                    <FormDescription>Choose your preferred video quality</FormDescription>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-2 pt-2 md:grid-cols-5"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="auto" />
                          </FormControl>
                          <FormLabel className="font-normal">Auto</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="1080p" />
                          </FormControl>
                          <FormLabel className="font-normal">1080p</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="720p" />
                          </FormControl>
                          <FormLabel className="font-normal">720p</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="480p" />
                          </FormControl>
                          <FormLabel className="font-normal">480p</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="360p" />
                          </FormControl>
                          <FormLabel className="font-normal">360p</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enablePiP"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Picture-in-Picture</FormLabel>
                      <FormDescription>Enable Picture-in-Picture mode for videos</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">App Settings</h2>
              <Separator />

              <FormField
                control={form.control}
                name="saveHistory"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Save Watch History</FormLabel>
                      <FormDescription>Keep track of videos you've watched</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="darkMode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Dark Mode</FormLabel>
                      <FormDescription>Use dark theme for the application</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit">Save Settings</Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
