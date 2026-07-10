import { requireAuth } from "@/lib/auth/get-current-user"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Upload } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  try {
    const user = await requireAuth()

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage your account preferences and information
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href="/dashboard/buyer">Back to Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Verification Status Alert */}
          {user.verification_status === "verified" ? (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Your account is fully verified and active
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="mb-6 border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Your account verification is pending. Please upload required documents.
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal and business information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input id="full_name" defaultValue={user.full_name} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" defaultValue={user.email} disabled />
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" defaultValue={user.phone} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_name">Company Name (Optional)</Label>
                      <Input id="company_name" defaultValue={user.company_name || ""} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="font-medium">Buyer</p>
                      <p className="text-sm text-muted-foreground">
                        Looking for investment opportunities
                      </p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button disabled>Save Changes (Coming Soon)</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Verification Tab */}
            <TabsContent value="verification">
              <Card>
                <CardHeader>
                  <CardTitle>Account Verification</CardTitle>
                  <CardDescription>
                    Upload proof of funds to access detailed property information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Email Verification</p>
                        <p className="text-sm text-muted-foreground">Your email is verified</p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>

                    {user.verification_status === "verified" ? null : (
                      <>
                        <div className="border-2 border-dashed rounded-lg p-8 text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-4 text-lg font-medium">Upload Proof of Funds</h3>
                          <p className="mt-2 text-sm text-gray-600">
                            Bank statements, investment portfolio, or other financial proof
                          </p>
                          <div className="mt-6">
                            <Button disabled>
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Document (Coming Soon)
                            </Button>
                          </div>
                        </div>

                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Once verified, you&apos;ll be able to sign NDAs and access confidential
                            property data
                          </AlertDescription>
                        </Alert>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your password and security preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Change Password</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="current_password">Current Password</Label>
                          <Input id="current_password" type="password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new_password">New Password</Label>
                          <Input id="new_password" type="password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm_password">Confirm New Password</Label>
                          <Input id="confirm_password" type="password" />
                        </div>
                        <Button disabled>Update Password (Coming Soon)</Button>
                      </div>
                    </div>

                    <div className="pt-6 border-t">
                      <h3 className="text-lg font-medium mb-4 text-red-600">Danger Zone</h3>
                      <div className="space-y-4">
                        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                          <h4 className="font-medium text-red-800">Delete Account</h4>
                          <p className="text-sm text-red-700 mt-1">
                            Permanently delete your account and all associated data
                          </p>
                          <Button variant="destructive" className="mt-4" disabled>
                            Delete Account (Coming Soon)
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  } catch (_error) {
    redirect("/auth/login")
  }
}
