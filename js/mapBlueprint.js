(function () {
  // Manual map blueprint for Athoria Special Operations.
  // Edit values here to shape the whole map without touching game.js.
  // Units: inches on board (board is 40 x 30).
  // Coordinate origin: top-left edge is x:0, y:0.
  // X grows to the right, Y grows downward.
  // Recommended segment format (anchor + direction):
  //   { x, y, width, height, direction, color?, label? }
  // x,y is the START point (one end of a wall), not the center.
  // direction: east / west / north / south ("sount" also accepted).
  // east/west: width = length, height = thickness.
  // north/south: height = length, width = thickness.
  // color is optional CSS color, e.g. "#ff8844", "orange", "rgb(255,120,40)".
  // label is optional wall text/number shown on the wall (if omitted, auto-number is used).
  // Legacy center format still works: { xIn, yIn, wIn, hIn }
  // Blocker can use both formats too.
  // Campfire:     { id, xIn, yIn }
  // Victory point:{ id, xIn, yIn }

  window.ASO_MAP_BLUEPRINT = {
    id: "building-manual-v1",
    layout: "building",
    board: { widthIn: 30, heightIn: 30 },
    wallThicknessIn: 0.25,

    walls: [
      // PLAYER 1 SPAWN ROOM (BOTTOM-LEFT), 5" x 5"
      // Room bounds: x=[0..5], y=[24.5..29.5]
      // Door width: 1.5" centered on top and right walls.

      // Left wall (full)
      { xIn: 0.0, yIn: 27.0, wIn: 0.25, hIn: 5.0, label: "P1-W" },

      // Bottom wall (full)
      { xIn: 2.5, yIn: 29.5, wIn: 5.0, hIn: 0.25, label: "P1-S" },

      // Top wall split (centered door: x=[1.75..3.25])
      { xIn: 0.875, yIn: 24.5, wIn: 1.75, hIn: 0.25, label: "P1-NL" },
      { xIn: 4.125, yIn: 24.5, wIn: 1.75, hIn: 0.25, label: "P1-NR" },

      // Right wall split (centered door: y=[26.25..27.75])
      { xIn: 5.0, yIn: 25.375, wIn: 0.25, hIn: 1.75, label: "P1-EU" },
      { xIn: 5.0, yIn: 28.625, wIn: 0.25, hIn: 1.75, label: "P1-EL" },

      // ROOM ABOVE P1, extending right by 10" (x=[0..10], y=[19.5..24.5])
      // All doors use 1.5" width.
      // Bottom side has centered door aligned with P1 top door.
      { xIn: 0.875, yIn: 24.5, wIn: 1.75, hIn: 0.25, label: "P1U-SL" },
      { xIn: 4.125, yIn: 24.5, wIn: 5.875, hIn: 0.25, label: "P1U-SR" },
      // Top door starts at 0" from the right wall (opening x=[8.5..10]).
      { xIn: 4.25, yIn: 19.5, wIn: 8.5, hIn: 0.25, label: "P1U-NL" },
      { xIn: 0.0, yIn: 22.0, wIn: 0.25, hIn: 5.0, label: "P1U-W" },
      { xIn: 10.0, yIn: 22.0, wIn: 0.25, hIn: 5.0, label: "P1U-E" },

      // CONNECTED ROOM, 5" x 5" (x=[5..10], y=[14.5..19.5])
      // Right wall has centered door; top door starts at 0" from the right wall.
      // Bottom door aligns with P1U top-right door (opening x=[8.5..10]).
      { xIn: 6.75, yIn: 19.5, wIn: 3.5, hIn: 0.25, label: "P1A-SL" },
      { xIn: 5.0, yIn: 17.0, wIn: 0.25, hIn: 5.0, label: "P1A-W" },
      { xIn: 6.75, yIn: 14.5, wIn: 3.5, hIn: 0.25, label: "P1A-NL" },
      { xIn: 10.0, yIn: 15.375, wIn: 0.25, hIn: 1.75, label: "P1A-EU" },
      { xIn: 10.0, yIn: 18.625, wIn: 0.25, hIn: 1.75, label: "P1A-EL" },

      // ROOM ABOVE, 5" x 5" (x=[5..10], y=[9.5..14.5])
      // Left wall has centered 1.5" door.
      // Bottom door aligns with room below top-right opening (x=[8.5..10]).
      { xIn: 6.75, yIn: 14.5, wIn: 3.5, hIn: 0.25, label: "P1B-SL" },
      { xIn: 7.5, yIn: 9.5, wIn: 5.0, hIn: 0.25, label: "P1B-N" },
      { xIn: 10.0, yIn: 12.0, wIn: 0.25, hIn: 5.0, label: "P1B-E" },
      { xIn: 5.0, yIn: 10.375, wIn: 0.25, hIn: 1.75, label: "P1B-WU" },
      { xIn: 5.0, yIn: 13.625, wIn: 0.25, hIn: 1.75, label: "P1B-WL" },

      // Close missing left corridor wall (x=0, y=[5.0..19.5]).
      { xIn: 0.0, yIn: 12.25, wIn: 0.25, hIn: 14.5, label: "LC-W" },

      // TOP-LEFT ROOM, 5" x 5" (x=[0..5], y=[0..5])
      { xIn: 2.5, yIn: 0.0, wIn: 5.0, hIn: 0.25, label: "TL-N" },
      // Bottom centered door (1.5")
      { xIn: 0.875, yIn: 5.0, wIn: 1.75, hIn: 0.25, label: "TL-SL" },
      { xIn: 4.125, yIn: 5.0, wIn: 1.75, hIn: 0.25, label: "TL-SR" },
      { xIn: 0.0, yIn: 2.5, wIn: 0.25, hIn: 5.0, label: "TL-W" },
      // Centered door to top corridor on the right side.
      { xIn: 5.0, yIn: 0.875, wIn: 0.25, hIn: 1.75, label: "TL-EU" },
      { xIn: 5.0, yIn: 4.125, wIn: 0.25, hIn: 1.75, label: "TL-EL" },

      // LONG RIGHT CORRIDOR, width 5" (x=[5..25], y=[24.5..29.5])
      // Top wall is shortened by 1.5" on the right end.
      { xIn: 14.25, yIn: 24.5, wIn: 18.5, hIn: 0.25, label: "COR-N" },
      { xIn: 15.0, yIn: 29.5, wIn: 20.0, hIn: 0.25, label: "COR-S" },

      // RIGHT EDGE OPEN ROOM, 5" x 5" (x=[25..30], y=[24.5..29.5])
      // Open from top and left: only bottom and right walls are present.
      { xIn: 27.5, yIn: 29.5, wIn: 5.0, hIn: 0.25, label: "R1-S" },
      { xIn: 29.875, yIn: 27.0, wIn: 0.25, hIn: 5.0, label: "R1-E" },

      // PLAYER 2 SPAWN ROOM (TOP-RIGHT), 5" x 5"
      // Room bounds: x=[25..30], y=[0..5]
      // Door width: 1.5" centered on bottom and left walls.
      { xIn: 27.5, yIn: 0.0, wIn: 5.0, hIn: 0.25, label: "P2-N" },
      { xIn: 29.875, yIn: 2.5, wIn: 0.25, hIn: 5.0, label: "P2-E" },
      { xIn: 25.0, yIn: 0.875, wIn: 0.25, hIn: 1.75, label: "P2-WU" },
      { xIn: 25.0, yIn: 4.125, wIn: 0.25, hIn: 1.75, label: "P2-WL" },
      { xIn: 25.875, yIn: 5.0, wIn: 1.75, hIn: 0.25, label: "P2-SL" },
      { xIn: 29.125, yIn: 5.0, wIn: 1.75, hIn: 0.25, label: "P2-SR" },

      // P2 LEFT COMPLEX (aligned to P1 symmetry toward map center)
      // LONG ROOM FROM P2, 5" x 10" directed DOWN (x=[20..25], y=[0..10])
      // Connected through P2 left-centered door.
      { xIn: 22.5, yIn: 0.0, wIn: 5.0, hIn: 0.25, label: "P2L-N" },
      { xIn: 22.5, yIn: 10.0, wIn: 5.0, hIn: 0.25, label: "P2L-S" },
      // Left door to first 5x5 room (opening y=[8.5..10.0]).
      { xIn: 20.0, yIn: 4.25, wIn: 0.25, hIn: 8.5, label: "P2L-WU" },

      // FIRST LEFT ROOM, 5" x 5" (x=[15..20], y=[5..10])
      // Right side door aligns with P2L left opening.
      // Left side has centered door to the next 5x5 room.
      { xIn: 17.5, yIn: 5.0, wIn: 5.0, hIn: 0.25, label: "P2A-N" },
      { xIn: 17.5, yIn: 10.0, wIn: 5.0, hIn: 0.25, label: "P2A-S" },
      { xIn: 15.0, yIn: 5.875, wIn: 0.25, hIn: 1.75, label: "P2A-WU" },
      { xIn: 15.0, yIn: 9.125, wIn: 0.25, hIn: 1.75, label: "P2A-WL" },

      // SECOND LEFT ROOM, 5" x 5" (x=[10..15], y=[5..10])
      // Right centered door connects from P2A.
      { xIn: 12.5, yIn: 5.0, wIn: 5.0, hIn: 0.25, label: "P2B-N" },
      { xIn: 12.5, yIn: 10.0, wIn: 5.0, hIn: 0.25, label: "P2B-S" },
      { xIn: 10.0, yIn: 7.5, wIn: 0.25, hIn: 5.0, label: "P2B-W" },
      // Shared divider with P2A is defined once by P2A-WU / P2A-WL to avoid overlap.

      // LONG DOWN CORRIDOR FROM P2, width 5" (x=[25..30], y=[5..24.5])
      // Right wall is shortened by 1.5" near the corridor end.
      { xIn: 25.0, yIn: 14.0, wIn: 0.25, hIn: 18.0, label: "P2-COR-W" },
      { xIn: 29.875, yIn: 14.0, wIn: 0.25, hIn: 18.0, label: "P2-COR-E" },
 

    ],

    blockers: [
      // First blocker at 2/3 corridor length, centered in corridor width.
      // Corridor width 5" and blocker leaves 1.5" passage on both sides.
      { xIn: 18.5, yIn: 27.0, wIn: 1.0, hIn: 2.0, label: "B1" },

      // P2 corridor blocker at 2/3 corridor length.
      // Leaves 1.5" passage on left and right sides.
      { xIn: 27.5, yIn: 18.0, wIn: 2.0, hIn: 1.0, label: "B3" },

    ],

    points: {
      campfires: [
        // Campfire on Player 1 spawn.
        { id: "cf-p1-spawn", xIn: 2.5, yIn: 27.0 },
        // Campfire on Player 2 spawn.
        { id: "cf-p2-spawn", xIn: 27.5, yIn: 2.5 }
      ],
      victory: [
        // Capture point in the center of the right-edge room.
        { id: "vp-right-room", xIn: 27.5, yIn: 27.0 },
        // Capture point in top-left 5x5 room.
        { id: "vp-top-left", xIn: 2.5, yIn: 2.5 },
        // Capture point in P2 second-left 5x5 room.
        { id: "vp-p2-left-corner", xIn: 12.5, yIn: 7.5 }
      ]
    }
  };
})();
