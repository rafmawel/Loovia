-- Table irl_indices — valeurs historiques de l'Indice de Référence des Loyers (INSEE)
CREATE TABLE public.irl_indices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quarter TEXT NOT NULL CHECK (quarter IN ('T1', 'T2', 'T3', 'T4')),
  year INTEGER NOT NULL,
  value NUMERIC NOT NULL,
  region TEXT NOT NULL DEFAULT 'metropole'
    CHECK (region IN ('metropole', 'corse', 'dom')),
  published_at DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (quarter, year, region)
);

CREATE INDEX idx_irl_indices_quarter_year ON public.irl_indices(quarter, year);

ALTER TABLE public.irl_indices ENABLE ROW LEVEL SECURITY;

-- Lecture publique (tous les utilisateurs authentifiés)
CREATE POLICY select_all ON public.irl_indices
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Écriture réservée au serveur (admin client)

-- ── Seed : indices IRL Métropole (source : INSEE) ──────────────────

INSERT INTO public.irl_indices (quarter, year, value, region) VALUES
  -- 2015
  ('T1', 2015, 125.19, 'metropole'),
  ('T2', 2015, 125.25, 'metropole'),
  ('T3', 2015, 125.26, 'metropole'),
  ('T4', 2015, 125.28, 'metropole'),
  -- 2016
  ('T1', 2016, 125.26, 'metropole'),
  ('T2', 2016, 125.25, 'metropole'),
  ('T3', 2016, 125.33, 'metropole'),
  ('T4', 2016, 125.50, 'metropole'),
  -- 2017
  ('T1', 2017, 125.90, 'metropole'),
  ('T2', 2017, 126.19, 'metropole'),
  ('T3', 2017, 126.46, 'metropole'),
  ('T4', 2017, 126.82, 'metropole'),
  -- 2018
  ('T1', 2018, 127.22, 'metropole'),
  ('T2', 2018, 127.77, 'metropole'),
  ('T3', 2018, 128.45, 'metropole'),
  ('T4', 2018, 129.03, 'metropole'),
  -- 2019
  ('T1', 2019, 129.38, 'metropole'),
  ('T2', 2019, 129.72, 'metropole'),
  ('T3', 2019, 129.99, 'metropole'),
  ('T4', 2019, 130.26, 'metropole'),
  -- 2020
  ('T1', 2020, 130.57, 'metropole'),
  ('T2', 2020, 130.57, 'metropole'),
  ('T3', 2020, 130.59, 'metropole'),
  ('T4', 2020, 130.52, 'metropole'),
  -- 2021
  ('T1', 2021, 130.69, 'metropole'),
  ('T2', 2021, 131.12, 'metropole'),
  ('T3', 2021, 131.67, 'metropole'),
  ('T4', 2021, 132.62, 'metropole'),
  -- 2022
  ('T1', 2022, 133.93, 'metropole'),
  ('T2', 2022, 135.84, 'metropole'),
  ('T3', 2022, 136.27, 'metropole'),
  ('T4', 2022, 137.26, 'metropole'),
  -- 2023
  ('T1', 2023, 138.61, 'metropole'),
  ('T2', 2023, 140.59, 'metropole'),
  ('T3', 2023, 141.03, 'metropole'),
  ('T4', 2023, 142.06, 'metropole'),
  -- 2024
  ('T1', 2024, 143.46, 'metropole'),
  ('T2', 2024, 145.17, 'metropole'),
  ('T3', 2024, 144.51, 'metropole'),
  ('T4', 2024, 144.64, 'metropole'),
  -- 2025
  ('T1', 2025, 145.47, 'metropole'),
  ('T2', 2025, 146.68, 'metropole'),
  ('T3', 2025, 145.77, 'metropole'),
  ('T4', 2025, 145.78, 'metropole')
ON CONFLICT (quarter, year, region) DO UPDATE SET value = EXCLUDED.value;
