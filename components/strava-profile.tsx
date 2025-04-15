import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { StravaAthlete } from "@/types/strava"

interface StravaProfileProps {
  athlete: StravaAthlete
}

export function StravaProfile({ athlete }: StravaProfileProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Strava Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={athlete.profile} alt={`${athlete.firstname} ${athlete.lastname}`} />
            <AvatarFallback>
              {athlete.firstname?.[0]}
              {athlete.lastname?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-bold">
              {athlete.firstname} {athlete.lastname}
            </h3>
            <p className="text-muted-foreground">
              {athlete.city}, {athlete.country}
            </p>
            {athlete.weight && <p className="text-sm text-muted-foreground">Weight: {athlete.weight}kg</p>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-muted p-3 rounded-md text-center">
            <p className="text-sm text-muted-foreground">Following</p>
            <p className="text-xl font-bold">{athlete.friend_count || 0}</p>
          </div>
          <div className="bg-muted p-3 rounded-md text-center">
            <p className="text-sm text-muted-foreground">Followers</p>
            <p className="text-xl font-bold">{athlete.follower_count || 0}</p>
          </div>
          <div className="bg-muted p-3 rounded-md text-center">
            <p className="text-sm text-muted-foreground">Activities</p>
            <p className="text-xl font-bold">-</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
