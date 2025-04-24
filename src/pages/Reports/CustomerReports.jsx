import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import PdfGen from "../../assets/pdfgen.png";
import logo from "../../assets/LogicLoom-2-04.png";
import { toast } from "react-toastify";

const Reports = () => {
  const [customers, setCustomers] = useState([]);
  const [onRentData, setOnRentData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filteredPaymentData, setFilteredPaymentData] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    // Fetch Customers
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/customerMaster`)
      .then((res) => {
        setCustomers(res.data);
      })
      .catch((err) => console.error("Error fetching customers:", err));

    // Fetch OnRent Data
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/onrent`)
      .then((res) => setOnRentData(res.data))
      .catch((err) => console.error("Error fetching onrent data:", err));

    // Fetch Payment Data
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/payment`)
      .then((res) => setPaymentData(res.data))
      .catch((err) => console.error("Error fetching payments data:", err));
  }, []);

  // Function to generate PDF document
  const generatePDFDoc = () => {
    if (
      !selectedCustomerId ||
      (filteredData.length === 0 && filteredPaymentData.length === 0)
    ) {
      toast.error("No data available to generate report");
      return null;
    }

    const doc = new jsPDF();
    doc.setFontSize(12);

    // Header
    const pageWidth = doc.internal.pageSize.width;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");

    // Logo
    const imgWidth = 40;
    const imgHeight = 10;
    const imgX = 10;
    const imgY = 10;

    doc.addImage(logo, "PNG", imgX, imgY, imgWidth, imgHeight);

    // Company Name
    doc.text("LogicLoom IT Solutions", pageWidth - 10, 18, { align: "right" });

    // Line below header
    doc.setLineWidth(0.5);
    doc.line(10, 25, pageWidth - 10, 25);

    let y = 35;

    // Customer Name
    doc.setFontSize(12);
    doc.text(`Customer Name : ${selectedCustomer}`, 10, y);
    y += 10;

    // ------------------ ON RENT DETAILS ------------------
    if (filteredData.length > 0) {
      doc.text("On Rent Details", 10, y);
      y += 5;

      autoTable(doc, {
        startY: y,
        head: [
          [
            "OnRent No",
            "OnRent Date",
            "Item Name",
            "UOM",
            "Total Qty",
            "Return Qty",
            "Balance Qty",
            "OnRentReturn Date",
            "Per Day Rate",
            "Used Days",
            "Amount",
          ],
        ],
        body: [
          ...filteredData.map((record) => [
            record.onRentNo,
            record.onRentDate,
            record.itemName,
            record.uom,
            record.totalQty,
            record.returnQty,
            record.balanceQty,
            record.onRentReturnDate,
            record.perDayRate,
            record.usedDays,
            record.amount ? record.amount.toFixed(2) : "0.00",
          ]),
          [
            {
              content: "Total",
              colSpan: 10,
              styles: { halign: "right", fontStyle: "bold" },
            },
            totalAmount.toFixed(2),
          ],
        ],
      });

      y = doc.lastAutoTable.finalY + 10;
    }

    // ------------------ PAYMENT DETAILS ------------------
    if (filteredPaymentData.length > 0) {
      if (y + 30 > doc.internal.pageSize.height) {
        doc.addPage();
        y = 10;
      }

      doc.text("Payment Details", 10, y);
      y += 5;

      autoTable(doc, {
        startY: y,
        head: [["Payment Date", "Payment Type", "Paid Amount"]],
        body: [
          ...filteredPaymentData.map((payment) => [
            payment.paymentDate,
            payment.paymentType,
            payment.paymentAmount.toFixed(2),
          ]),
          [
            {
              content: "Total",
              colSpan: 2,
              styles: { halign: "right", fontStyle: "bold" },
            },
            totalPaidAmount.toFixed(2),
          ],
        ],
      });

      y = doc.lastAutoTable.finalY + 10;
    }

    // ------------------ SUMMARY ------------------
    if (filteredData.length > 0 || filteredPaymentData.length > 0) {
      if (y + 30 > doc.internal.pageSize.height) {
        doc.addPage();
        y = 10;
      }

      doc.text("Summary", 10, y);
      y += 5;

      autoTable(doc, {
        startY: y,
        body: [
          ["Total Amount", totalAmount.toFixed(2)],
          ["Total Paid Amount", totalPaidAmount.toFixed(2)],
          ["Balance Amount", (totalAmount - totalPaidAmount).toFixed(2)],
        ],
        columnStyles: {
          0: { fontStyle: "bold" },
          1: { halign: "right" },
        },
        didParseCell: function (data) {
          if (data.row.index === 1) {
            data.cell.styles.textColor = "#008000"; // Green
          } else if (data.row.index === 2) {
            data.cell.styles.textColor = "#FF0000"; // Red
          }
        },
      });
    }

    return doc;
  };

  const sendMail = async () => {
    try {
      setIsGenerating(true);

      // Generate the PDF
      const doc = generatePDFDoc();
      if (!doc) return;

      // Convert PDF to base64
      const pdfData = doc.output("datauristring");

      // Send PDF data to backend
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/report/send-report`,
        {
          customerId: selectedCustomerId, // Send the selected customer ID
          pdfBase64: pdfData, // Base64 string of the PDF
          customerName: selectedCustomer, // Send the customer name
        }
      );

      toast.success("Email sent successfully!");
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error(
        "Failed to send email: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setIsGenerating(false);
    }
  };
  const handleFilter = () => {
    if (!selectedCustomerId) return;

    const today = new Date();
    const formattedToday = today.toLocaleDateString();

    // Filter OnRent Data by Customer ID
    const filtered = onRentData.filter(
      (record) => record.customer?.id === selectedCustomerId
    );

    const structuredData = filtered.flatMap(
      (record) =>
        record.items.flatMap((item) => {
          const originalOnRentReturnDate =
            item.onRentReturnDate && item.onRentReturnDate !== "null"
              ? new Date(item.onRentReturnDate).toLocaleDateString()
              : formattedToday;

          const balanceQty = item.remainingQty;
          const usedDays = Math.floor(
            (today - new Date(record.onRentDate)) / (1000 * 60 * 60 * 24)
          );

          const amount = balanceQty * item.perDayRate * usedDays;

          const originalRow = {
            onRentNo: record.onRentNo,
            onRentDate: new Date(record.onRentDate).toLocaleDateString(),
            itemName: item.itemName,
            uom: item.uom.uom,
            totalQty: item.qtyOrWeight,
            returnQty: item.qtyReturn,
            balanceQty: balanceQty,
            onRentReturnDate: originalOnRentReturnDate,
            perDayRate: item.perDayRate,
            usedDays: item.usedDays,
            amount: item.amount,
          };

          const additionalRow =
            balanceQty > 0
              ? {
                  ...originalRow,
                  returnQty: 0,
                  onRentReturnDate: formattedToday,
                  usedDays: usedDays,
                  amount: amount,
                }
              : null;

          return additionalRow ? [originalRow, additionalRow] : [originalRow];
        }),
      setHasSearched(true)
    );

    // Filter Payment Data by customerId
    const filteredPayments = paymentData
      .filter((payment) => payment.customerId === selectedCustomerId)
      .map((payment) => ({
        paymentDate: new Date(payment.createdAt).toLocaleDateString(),
        paymentAmount: payment.paidAmount,
        paymentType: payment.paymentType || "Cash",
      }));

    setFilteredData(structuredData);
    setFilteredPaymentData(filteredPayments);
  };

  const totalAmount = filteredData.reduce(
    (sum, record) => sum + (record.amount || 0),
    0
  );
  const totalPaidAmount = filteredPaymentData.reduce(
    (sum, payment) => sum + payment.paymentAmount,
    0
  );
  const customerOptions = customers.map((customer) => ({
    value: customer.id, // 👈 Use ID here
    label: customer.customerName,
  }));

  const handleGeneratePDF = () => {
    const doc = generatePDFDoc();
    if (doc) {
      // Save the PDF
      doc.save(`${selectedCustomer}_report.pdf`);
      toast.success("PDF generated successfully");
    }
  };

  return (
    <div className="container  mt-1 p-1">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h3>Reports</h3>
      </div>

      {/* Customer Dropdown */}
      <div className="card p-4">
        <div className="row align-items-center  mb-4">
          <div className=" col-md-4 d-flex align-items-center ">
            <div className="w-100 ms-2">
              <strong>Customer Name</strong>
              <Select
                style={{ minWidth: "250px" }}
                options={customerOptions}
                value={customerOptions.find(
                  (c) => c.value === selectedCustomerId
                )}
                onChange={(selectedOption) => {
                  setSelectedCustomerId(selectedOption?.value || "");
                  setSelectedCustomer(selectedOption?.label || "");
                  setHasSearched(false);
                  setFilteredData([]);
                  setFilteredPaymentData([]);
                }}
                isClearable
                isSearchable
                placeholder="Select Customer"
              />
            </div>
          </div>
          <div className="col-md-1 mt-4 ">
            <button
              className="btn btn-primary w-100"
              style={{ width: "50px", minWidth: "50px" }}
              onClick={handleFilter}
            >
              Go
            </button>
          </div>
          {selectedCustomerId &&
            (filteredData.length > 0 || filteredPaymentData.length > 0) && (
              <div className="d-flex justify-content-end col-md-auto mt-4 align-items-center ps-4 gap-3">
                <button
                  className="btn btn-outline-primary d-flex align-items-center"
                  onClick={handleGeneratePDF}
                >
                  <img
                    src={PdfGen}
                    alt="Generate PDF"
                    className="me-2"
                    style={{ width: "23px", height: "23px" }}
                  />
                  Generate PDF
                </button>

                <button
                  type="button"
                  className="btn btn-success"
                  onClick={sendMail}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Sending..." : "Send Mail"}
                </button>
              </div>
            )}
        </div>
        <div id="report-content">
          {/* On Rent Data Table */}
          {hasSearched &&
            (filteredData.length > 0 ? (
              <div>
                <h4>On Rent Details</h4>
                <div className="table-responsive">
                  <table className="table table-sm table-bordered shadow-sm">
                    <thead className="table-light">
                      <tr>
                        <th>OnRent No</th>
                        <th>OnRent Date</th>
                        <th>Item Name</th>
                        <th>UOM</th>
                        <th>Total Qty</th>
                        <th>Return Qty</th>
                        <th>Balance Qty</th>
                        <th>OnRentReturn Date</th>
                        <th>Per Day Rate</th>
                        <th>Used Days</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((record, index) => (
                        <tr key={index}>
                          <td
                            style={{
                              cursor: "pointer",
                              color: "blue",
                              textDecoration: "underline",
                            }}
                            onClick={() => {
                              if (!record?.onRentNo) {
                                console.warn(
                                  "onRentNo is missing, cannot open new tab"
                                );
                                return;
                              }

                              const onRentNo = record.onRentNo; // Fallback in case function fails
                              const url = `${
                                import.meta.env.VITE_API_BASE_URL2
                              }/app/transactions/onrent?onRentNo=${onRentNo}`;

                              window.open(url, "_blank");
                            }}
                          >
                            {record?.onRentNo}
                          </td>
                          <td>{record.onRentDate}</td>
                          <td>{record.itemName}</td>
                          <td>{record.uom}</td>
                          <td>{record.totalQty}</td>
                          <td>{record.returnQty}</td>
                          <td>{record.balanceQty}</td>
                          <td>{record.onRentReturnDate}</td>
                          <td>{record.perDayRate}</td>
                          <td>{record.usedDays}</td>
                          <td>{record.amount}</td>
                        </tr>
                      ))}
                      <tr className="fw-bold bg-light">
                        <td colSpan="10" className="text-end">
                          Total Amount:
                        </td>
                        <td>{totalAmount.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="px-2 text-danger">
                No on-rent records found for selected customer.
              </p>
            ))}

          {/* Payment Data Table */}
          {hasSearched &&
            (filteredPaymentData.length > 0 ? (
              <div className="mt-3">
                <h4>Payment Details</h4>
                <div className="table-responsive">
                  <table className="table table-sm shadow-sm table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Payment Date</th>
                        <th>Payment Type</th>
                        <th>Paid Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPaymentData.map((payment, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{payment.paymentDate}</td>
                          <td>{payment.paymentType}</td>
                          <td>{payment.paymentAmount}</td>
                        </tr>
                      ))}
                      <tr className="fw-bold bg-light">
                        <td colSpan="3" className="text-end">
                          Total Paid Amount:
                        </td>
                        <td>{totalPaidAmount.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Summary Section */}
                <div className="mt-4 p-3 border rounded bg-light shadow-lg">
                  <h4 className="text-center">Summary</h4>
                  <div className="row text-center text-md-start">
                    <div className="col-12 col-md-4 mb-2">
                      <p className="mb-1">
                        <strong>Total Amount:</strong>
                      </p>
                      <span className="fs-5">{totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="col-12 col-md-4 mb-2">
                      <p className="mb-1">
                        <strong>Total Paid Amount:</strong>
                      </p>
                      <span className="fs-5 text-success">
                        {totalPaidAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="col-12 col-md-4">
                      <p className="mb-1">
                        <strong>Balance Amount:</strong>
                      </p>
                      <span className="fs-5 text-danger">
                        {(totalAmount - totalPaidAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="px-2 text-danger">
                No payments found for selected customer.
              </p>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
