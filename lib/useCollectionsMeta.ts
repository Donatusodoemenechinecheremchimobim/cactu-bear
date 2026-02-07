"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { CollectionMeta } from "@/types/product";

export function useCollectionsMeta() {
  const [collections, setCollections] = useState<CollectionMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "collections"), (snap) => {
      const list: CollectionMeta[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<CollectionMeta, "id">),
      }));
      setCollections(list);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { collections, loading };
}
