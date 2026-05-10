import { useFavorit as useFavoritFromContext } from "@/context/FavoritContext";

export function useFavorit() {
  return useFavoritFromContext();
}
