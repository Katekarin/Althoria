(function () {
  window.ASO_MAP_BLUEPRINT = {
    id: "sample-map-30x30",
    layout: "building",
    board: { widthIn: 30, heightIn: 30 },
    wallThicknessIn: 0.25,

    walls: [
      { xIn: 2.5, yIn: 29.5, wIn: 5.0, hIn: 0.25, label: "P1-S" },
      { xIn: 0.0, yIn: 27.0, wIn: 0.25, hIn: 5.0, label: "P1-W" },
      { xIn: 27.5, yIn: 0.0, wIn: 5.0, hIn: 0.25, label: "P2-N" },
      { xIn: 29.875, yIn: 2.5, wIn: 0.25, hIn: 5.0, label: "P2-E" },
      { xIn: 15.0, yIn: 15.0, wIn: 0.25, hIn: 10.0, label: "MID-W" },
      { xIn: 15.0, yIn: 10.0, wIn: 10.0, hIn: 0.25, label: "MID-N" }
    ],

    blockers: [
      { xIn: 18.5, yIn: 26.5, wIn: 1.0, hIn: 2.0, label: "B1" }
    ],

    points: {
      campfires: [
        { id: "cf-p1", xIn: 2.5, yIn: 27.0 },
        { id: "cf-p2", xIn: 27.5, yIn: 2.5 }
      ],
      victory: [
        { id: "vp-mid", xIn: 15.0, yIn: 15.0 },
        { id: "vp-corner", xIn: 27.5, yIn: 27.0 }
      ]
    }
  };
})();
