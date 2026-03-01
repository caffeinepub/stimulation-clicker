import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface LeaderboardEntry {
    prestigeCount: bigint;
    name: string;
    score: bigint;
}
export interface GlobalStats {
    totalPlayers: bigint;
    totalPrestige: bigint;
    totalClicks: bigint;
}
export interface backendInterface {
    getGlobalStats(): Promise<GlobalStats>;
    getLeaderboard(): Promise<Array<LeaderboardEntry>>;
    submitScore(name: string, score: bigint, prestigeCount: bigint): Promise<boolean>;
}
