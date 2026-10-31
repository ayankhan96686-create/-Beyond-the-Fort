# Visitor Guide

## Create an account and sign in

Use **Sign in** in the navigation or visit `/register` to create an account. Use a valid email and a 12–128 character password containing lowercase, uppercase, and a number. Password reset is not available because this prototype has no configured email service. Sign out from Account or the navigation.

## Language and discovery

Choose a language from the shared language menu. The existing selector supports 21 locales with English fallback; authentication labels have been integrated with the selector, but their translations are currently English fallbacks. Browse public attractions and ask Tansen AI tourism questions without an account.

## Plan and save a visit

Sign in before generating a personalized itinerary. Select interests, visit date, start/deadline, travel mode, and a starting point. Browser location is requested only after pressing the location button; you can instead set map pins or enter coordinates. The planner needs real coordinates and may use the configured routing provider. A plan is an estimate, not a guaranteed arrival time. Feasible plans are saved to your account. View, reopen, or delete them on `/account`. Saved plans contain the coordinates you submitted and expire after 365 days when the store is accessed.

The active plan is also held in the current browser tab so its map can be displayed. Typed place labels are not geocoded. Prices and many opening hours are missing or unverified; confirm details before visiting.
