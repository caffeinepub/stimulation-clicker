import Array "mo:core/Array";
import Order "mo:core/Order";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";

actor {
  type LeaderboardEntry = {
    name : Text;
    score : Nat;
    prestigeCount : Nat;
  };

  module LeaderboardEntry {
    public func compareByScoreDesc(a : LeaderboardEntry, b : LeaderboardEntry) : Order.Order {
      // Reversed comparison to sort in descending order
      switch (Nat.compare(a.score, b.score)) {
        case (#less) { #greater };
        case (#greater) { #less };
        case (#equal) { Text.compare(a.name, b.name) };
      };
    };
  };

  type GlobalStats = {
    totalClicks : Nat;
    totalPrestige : Nat;
    totalPlayers : Nat;
  };

  let leaderboardEntries = Map.empty<Text, LeaderboardEntry>();
  var totalClicks = 0;
  var totalPrestige = 0;

  public shared ({ caller }) func submitScore(name : Text, score : Nat, prestigeCount : Nat) : async Bool {
    if (score == 0 or name.trim(#char ' ') == "") {
      Runtime.trap("Score must be greater than 0 and name must not be empty");
    };

    switch (leaderboardEntries.get(name)) {
      case (?existingEntry) {
        if (score > existingEntry.score) {
          let updatedEntry : LeaderboardEntry = {
            name;
            score;
            prestigeCount;
          };
          leaderboardEntries.add(name, updatedEntry);
          totalClicks += score - existingEntry.score;
        };
      };
      case (null) {
        let newEntry : LeaderboardEntry = {
          name;
          score;
          prestigeCount;
        };
        leaderboardEntries.add(name, newEntry);
        totalClicks += score;
      };
    };

    totalPrestige += prestigeCount;

    // Keep only top 10 entries
    let entriesArray = leaderboardEntries.values().toArray().sort(
      LeaderboardEntry.compareByScoreDesc
    );
    let top10 = entriesArray.sliceToArray(0, if (entriesArray.size() > 10) { 10 } else { entriesArray.size() });

    leaderboardEntries.clear();
    for (entry in top10.values()) {
      leaderboardEntries.add(entry.name, entry);
    };
    true;
  };

  public query ({ caller }) func getLeaderboard() : async [LeaderboardEntry] {
    leaderboardEntries.values().toArray().sort(
      LeaderboardEntry.compareByScoreDesc
    ).sliceToArray(0, if (leaderboardEntries.size() > 10) { 10 } else { leaderboardEntries.size() });
  };

  public query ({ caller }) func getGlobalStats() : async GlobalStats {
    {
      totalClicks;
      totalPrestige;
      totalPlayers = leaderboardEntries.size();
    };
  };
};
