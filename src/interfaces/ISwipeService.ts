import { IUserSwipe } from "./IUserSwipeDto"

export interface ISwipeService {
    createSwipe(swipe: IUserSwipe): Promise<void>
    getUserSwipedProfiles(user_id: string): Promise<any[]>
    getMatchCounts(user_id: string): Promise<{total_swipe: number, positive_match: number }>
    calculateAttractiveness(user_id: string): Promise<void>
  }