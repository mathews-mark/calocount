export interface StravaAthlete {
  id: number
  username: string
  firstname: string
  lastname: string
  city: string
  state: string
  country: string
  sex: string
  premium: boolean
  created_at: string
  updated_at: string
  profile: string
  profile_medium: string
  follower_count: number
  friend_count: number
  measurement_preference: string
  weight: number
  clubs: any[]
  bikes: any[]
  shoes: any[]
}

export interface StravaActivity {
  id: number
  name: string
  distance: number
  moving_time: number
  elapsed_time: number
  total_elevation_gain: number
  type: string
  sport_type: string
  start_date: string
  start_date_local: string
  timezone: string
  utc_offset: number
  location_city: string | null
  location_state: string | null
  location_country: string | null
  achievement_count: number
  kudos_count: number
  comment_count: number
  athlete_count: number
  photo_count: number
  map: {
    id: string
    summary_polyline: string
    polyline: string
  }
  trainer: boolean
  commute: boolean
  manual: boolean
  private: boolean
  visibility: string
  flagged: boolean
  gear_id: string | null
  start_latlng: [number, number] | null
  end_latlng: [number, number] | null
  average_speed: number
  max_speed: number
  average_cadence: number | null
  average_watts: number | null
  weighted_average_watts: number | null
  kilojoules: number | null
  device_watts: boolean | null
  has_heartrate: boolean
  average_heartrate: number | null
  max_heartrate: number | null
  heartrate_opt_out: boolean
  display_hide_heartrate_option: boolean
  elev_high: number | null
  elev_low: number | null
  upload_id: number | null
  upload_id_str: string | null
  external_id: string | null
  from_accepted_tag: boolean
  pr_count: number
  total_photo_count: number
  has_kudoed: boolean
  suffer_score: number | null
  calories: number | null
}
