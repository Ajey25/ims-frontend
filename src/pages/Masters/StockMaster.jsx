import { useEffect, useState } from "react";
import Select, { components } from "react-select";
import Pagination from "../../components/Pagination"; // update path if needed

const SELECT_ALL_OPTION = { value: "*", label: "Select All" };

const ItemMaster = () => {
  const [items, setItems] = useState([]);
  const [options, setOptions] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // reset to first page when filters change
  }, [filteredItems]);

  const fetchItems = async () => {
    try {
      const stockRes = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/stockMaster`
      );
      const itemRes = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/itemMaster`
      );

      if (!stockRes.ok || !itemRes.ok) throw new Error("Fetch failed");

      const stockData = await stockRes.json();
      const itemData = await itemRes.json();

      const merged = stockData.map((stockItem) => {
        const matched = itemData.find((i) => i.id === stockItem.item_id);
        return {
          ...stockItem,
          itemName: matched?.itemName || "Unknown Item",
          itemCode: matched?.itemCode || "Unknown Code",
          description: matched?.description || "No description",
        };
      });

      setItems(merged);

      const itemOptions = Array.from(
        new Map(merged.map((item) => [item.item_id, item])).values()
      ).map((item) => ({
        value: item.item_id,
        label: item.itemName || `Item ${item.item_id}`,
      }));

      setOptions([SELECT_ALL_OPTION, ...itemOptions]);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleFilterChange = (selected) => {
    if (!selected) return setSelectedFilters([]);
    const isSelectAll = selected.some((s) => s.value === "*");
    const validOptions = options.filter((o) => o.value !== "*");

    if (isSelectAll || selected.length === validOptions.length) {
      setSelectedFilters([SELECT_ALL_OPTION]);
    } else {
      setSelectedFilters(selected);
    }
  };

  const getActualSelectedItems = () => {
    if (selectedFilters.some((s) => s.value === "*")) return items;
    return items.filter((item) =>
      selectedFilters.some((s) => s.value === item.item_id)
    );
  };

  const handleGo = () => {
    const filtered = getActualSelectedItems();
    setFilteredItems(filtered);
    setShowTable(true);
  };

  const customMultiValue = (props) => {
    if (props.data.value === "*") {
      return (
        <components.MultiValue {...props}>
          <span>Select All</span>
        </components.MultiValue>
      );
    }
    return <components.MultiValue {...props} />;
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };
  const getSortIndicator = (key) => {
    const active = sortConfig.key === key;

    return (
      <span
        style={{
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          marginLeft: 4,
          lineHeight: "0.75em",
        }}
      >
        <span
          style={{
            color: active && sortConfig.direction === "asc" ? "white" : "#aaa",
            fontSize: "1em",
          }}
        >
          ▲
        </span>
        <span
          style={{
            color: active && sortConfig.direction === "desc" ? "white" : "#aaa",
            fontSize: "1em",
          }}
        >
          ▼
        </span>
      </span>
    );
  };

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
    }

    return sortConfig.direction === "asc"
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const paginatedData = sortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  return (
    <div className="container mt-1 px-0">
      <h4 className="mb-3">Stock Master</h4>

      <div className="d-flex align-items-start gap-3 mb-3">
        <div style={{ width: 300 }}>
          <Select
            isMulti
            options={options}
            value={selectedFilters}
            onChange={handleFilterChange}
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            placeholder="Filter Items..."
            components={{ MultiValue: customMultiValue }}
          />
        </div>

        <button
          className="btn btn-success"
          disabled={selectedFilters.length === 0}
          onClick={handleGo}
        >
          Go
        </button>
      </div>

      {showTable && (
        <>
          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead className="table-primary">
                <tr>
                  <th>Sr No.</th>
                  <th>Item Name</th>
                  <th>Item Code</th>
                  <th>Description</th>
                  <th
                    onClick={() => requestSort("qty")}
                    style={{ cursor: "pointer" }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      Quantity
                      {getSortIndicator("qty")}
                    </span>
                  </th>
                  <th
                    onClick={() => requestSort("weight")}
                    style={{ cursor: "pointer" }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      Weight
                      {getSortIndicator("weight")}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item, index) => (
                    <tr key={item.id}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>{item.itemName}</td>
                      <td>{item.itemCode}</td>
                      <td>{item.description}</td>
                      <td>{item.qty}</td>
                      <td>{item.weight}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Custom Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ItemMaster;
