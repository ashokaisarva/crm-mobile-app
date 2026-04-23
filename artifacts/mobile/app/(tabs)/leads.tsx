import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "@/components/Icon";
import { LeadCard } from "@/components/LeadCard";
import { useColors } from "@/hooks/useColors";
import { LeadItem, getLeads } from "@/services/api";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STATUS_FILTERS = ["All", "Pre Qualified", "Contacted", "Qualified", "Lost"];

export default function LeadsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeSearch = useRef("");

  const topInsets = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 64 : insets.bottom + 80;

  const fetchLeads = useCallback(async (
    page: number,
    statusFilter: string,
    searchText: string,
    append: boolean
  ) => {
    try {
      const res = await getLeads({
        status: statusFilter === "All" ? "" : statusFilter,
        title: searchText,
        page,
      });
      if (res.success) {
        const items = res.leads.data;
        setLeads(prev => append ? [...prev, ...items] : items);
        setCurrentPage(res.leads.current_page);
        setLastPage(res.leads.last_page);
        setTotal(res.leads.total);
        setError(null);
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to load leads");
    }
  }, []);

  const load = useCallback(async (statusFilter = filter, searchText = activeSearch.current) => {
    setLoading(true);
    setLeads([]);
    await fetchLeads(1, statusFilter, searchText, false);
    setLoading(false);
  }, [filter, fetchLeads]);

  useEffect(() => {
    load(filter, "");
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLeads(1, filter, activeSearch.current, false);
    setRefreshing(false);
  }, [filter, fetchLeads]);

  const onLoadMore = useCallback(async () => {
    if (loadingMore || currentPage >= lastPage) return;
    setLoadingMore(true);
    await fetchLeads(currentPage + 1, filter, activeSearch.current, true);
    setLoadingMore(false);
  }, [loadingMore, currentPage, lastPage, filter, fetchLeads]);

  const applyFilter = useCallback((f: string) => {
    setFilter(f);
    load(f, activeSearch.current);
  }, [load]);

  const applySearch = useCallback((text: string) => {
    setSearch(text);
    activeSearch.current = text;
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      load(filter, text);
    }, 400);
  }, [filter, load]);

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator color={colors.primary} size="small" />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInsets + 16, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Leads</Text>
          {!loading && (
            <Text style={[styles.headerCount, { color: colors.mutedForeground }]}>{total} total</Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/add-lead" as any)}
        >
          <Icon name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Icon name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search by title, person, company..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={applySearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => applySearch("")}>
              <Icon name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter tabs */}
      <View style={[styles.filterScroll, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {STATUS_FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterBtn,
              filter === f && { borderBottomWidth: 2, borderBottomColor: colors.primary },
            ]}
            onPress={() => applyFilter(f)}
          >
            <Text style={[
              styles.filterText,
              { color: filter === f ? colors.primary : colors.mutedForeground },
              filter === f && styles.filterTextActive,
            ]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading leads...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Icon name="alert-circle" size={40} color={colors.mutedForeground} />
          <Text style={[styles.errorText, { color: colors.mutedForeground }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.primary }]}
            onPress={() => load()}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={leads}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => <LeadCard lead={item} />}
          contentContainerStyle={{ padding: 16, paddingBottom: bottomPad }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon name="users" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No leads found</Text>
              {search || filter !== "All" ? (
                <Text style={[styles.emptyHint, { color: colors.mutedForeground }]}>
                  Try clearing the search or filter
                </Text>
              ) : null}
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 24, fontFamily: "Poppins_700Bold" },
  headerCount: { fontSize: 12, fontFamily: "Poppins_400Regular", marginTop: 1 },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
  },
  filterScroll: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingHorizontal: 4,
  },
  filterBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    minWidth: 60,
  },
  filterText: {
    fontSize: 11,
    fontFamily: "Poppins_500Medium",
    textAlign: "center",
  },
  filterTextActive: {
    fontFamily: "Poppins_700Bold",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 32,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
  },
  errorText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  retryText: {
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 10,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
  },
  emptyHint: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
  },
  loadingMore: {
    paddingVertical: 16,
    alignItems: "center",
  },
});
