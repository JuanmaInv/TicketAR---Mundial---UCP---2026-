"use client";

import { useState } from "react";

// Mock de datos: Simulamos lo que vendría de la API del Mundial
const ALL_MATCHES = [
  { id: 1, teamA: "Argentina", teamB: "Argelia", phase: "Grupos", date: "2026-06-15", price: 2000, stadium: "Arrowhead Stadium" },
  { id: 2, teamA: "Argentina", teamB: "Austria", phase: "Grupos", date: "2026-06-20", price: 7000, stadium: "AT&T Stadium" },
  { id: 3, teamA: "Brasil", teamB: "España", phase: "Octavos", date: "2026-07-01", price: 12000, stadium: "MetLife Stadium" },
  { id: 4, teamA: "Francia", teamB: "Jordania", phase: "Grupos", date: "2026-06-18", price: 3000, stadium: "SoFi Stadium" },
  { id: 5, teamA: "Argentina", teamB: "Jordania", phase: "Grupos", date: "2026-06-25", price: 5000, stadium: "Hard Rock Stadium" },
];


