import { useEffect, useState } from "react";
import {
  FileText,
  Users,
  UserCog,
  Wallet,
  ClipboardList,
  Printer,
  X,
} from "lucide-react";
import { reportAPI, classAPI } from "../api";
import Table from "../components/common/Table";
import {
  formatDate,
  formatCurrency,
  getFullName,
  statusColor,
  getInitialsFromName,
} from "../utils/helpers";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const reportTypes = [
  {
    name: "students",
    label: "Student Report",
    icon: Users,
    description: "List of all students",
  },
  {
    name: "teachers",
    label: "Teacher Report",
    icon: UserCog,
    description: "List of all teachers",
  },
  {
    name: "fees",
    label: "Fee Report",
    icon: Wallet,
    description: "Fee collection summary",
  },
  {
    name: "academic",
    label: "Academic Report",
    icon: ClipboardList,
    description: "Exam performance results",
  },
];

const Reports = () => {
  const [activeReport, setActiveReport] = useState("students");
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [filters, setFilters] = useState({ class_id: "", status: "" });
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedFee, setSelectedFee] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (activeReport) loadReport();
  }, [activeReport, filters]);

  useEffect(() => {
    setStudentSearch("");
    setSelectedFee(null);
    setShowInvoice(false);
  }, [activeReport]);

  const loadClasses = async () => {
    try {
      const res = await classAPI.getAll({ limit: 100 });
      setClasses(res.data.data);
    } catch (error) {
      console.error("Load classes error:", error);
    }
  };

  const loadReport = async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (!params.class_id) delete params.class_id;
      if (!params.status) delete params.status;

      let res;
      switch (activeReport) {
        case "students":
          res = await reportAPI.getStudents(params);
          setData(res.data.data);
          setSummary({ total: res.data.data.length });
          break;
        case "teachers":
          res = await reportAPI.getTeachers(params);
          setData(res.data.data);
          setSummary({ total: res.data.data.length });
          break;
        case "fees":
          res = await reportAPI.getFees(params);
          setData(res.data.data.fees || []);
          setSummary(res.data.data.summary);
          break;
        case "academic":
          res = await reportAPI.getAcademic(params);
          setData(res.data.data);
          setSummary({ total: res.data.data.length });
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Load report error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData =
    activeReport === "fees" && studentSearch.trim()
      ? data.filter((fee) => {
          const studentName = fee.Student
            ? getFullName(fee.Student.first_name, fee.Student.last_name)
            : "";
          return studentName
            .toLowerCase()
            .includes(studentSearch.trim().toLowerCase());
        })
      : data;

  const handleGenerateReport = () => {
    if (activeReport === "fees") {
      if (!selectedFee) {
        alert("Please click a student name to select an invoice first");
        return;
      }
      setShowInvoice(true);
      return;
    }
    loadReport();
  };

  const printInvoice = () => window.print();

  const getColumns = () => {
    switch (activeReport) {
      case "students":
        return [
          {
            header: "Student",
            accessor: "first_name",
            render: (row) => (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold flex-shrink-0 overflow-hidden">
                  {row.photo ? (
                    <img
                      src={`${API_URL.replace("/api", "")}/uploads/${row.photo}`}
                      alt={row.first_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitialsFromName(row.first_name, row.last_name)
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {getFullName(row.first_name, row.last_name)}
                  </p>
                  <p className="text-xs text-gray-500">{row.student_id}</p>
                </div>
              </div>
            ),
          },
          {
            header: "Gender",
            accessor: "gender",
            render: (row) => <span className="capitalize">{row.gender}</span>,
          },
          {
            header: "Class",
            accessor: "Class",
            render: (row) => row.Class?.name || "-",
          },
          {
            header: "Phone",
            accessor: "phone",
            render: (row) => row.phone || "-",
          },
          {
            header: "Admission",
            accessor: "admission_date",
            render: (row) => formatDate(row.admission_date),
          },
          {
            header: "Status",
            accessor: "status",
            render: (row) => (
              <span className={statusColor[row.status] || "badge-gray"}>
                {row.status}
              </span>
            ),
          },
        ];
      case "teachers":
        return [
          {
            header: "Teacher",
            accessor: "first_name",
            render: (row) => (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-semibold flex-shrink-0 overflow-hidden">
                  {row.photo ? (
                    <img
                      src={`${API_URL.replace("/api", "")}/uploads/${row.photo}`}
                      alt={row.first_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitialsFromName(row.first_name, row.last_name)
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {getFullName(row.first_name, row.last_name)}
                  </p>
                  <p className="text-xs text-gray-500">{row.teacher_id}</p>
                </div>
              </div>
            ),
          },
          {
            header: "Specialization",
            accessor: "specialization",
            render: (row) => row.specialization || "-",
          },
          {
            header: "Department",
            accessor: "department",
            render: (row) => row.department || "-",
          },
          {
            header: "Phone",
            accessor: "phone",
            render: (row) => row.phone || "-",
          },
          {
            header: "Classes",
            accessor: "Classes",
            render: (row) => row.Classes?.length || 0,
          },
          {
            header: "Status",
            accessor: "status",
            render: (row) => (
              <span className={statusColor[row.status] || "badge-gray"}>
                {row.status}
              </span>
            ),
          },
        ];
      case "fees":
        return [
          {
            header: "Invoice",
            accessor: "invoice_no",
            render: (row) => (
              <div>
                <p className="font-medium">{row.invoice_no}</p>
                <p className="text-xs text-gray-500 capitalize">
                  {row.fee_type}
                </p>
              </div>
            ),
          },
          {
            header: "Student",
            accessor: "Student",
            render: (row) =>
              row.Student ? (
                <button
                  type="button"
                  className={`font-medium hover:text-primary-600 ${selectedFee?.id === row.id ? "text-primary-600 underline" : ""}`}
                  onClick={() => setSelectedFee(row)}
                >
                  {getFullName(row.Student.first_name, row.Student.last_name)}
                </button>
              ) : (
                "-"
              ),
          },
          {
            header: "Amount",
            accessor: "amount",
            render: (row) => formatCurrency(row.amount),
          },
          {
            header: "Paid",
            accessor: "paid_amount",
            render: (row) => (
              <span className="text-green-600">
                {formatCurrency(row.paid_amount)}
              </span>
            ),
          },
          {
            header: "Due",
            accessor: "amount",
            render: (row) =>
              formatCurrency(
                parseFloat(row.amount) -
                  parseFloat(row.discount || 0) -
                  parseFloat(row.paid_amount || 0),
              ),
          },
          {
            header: "Status",
            accessor: "status",
            render: (row) => (
              <span className={statusColor[row.status] || "badge-gray"}>
                {row.status}
              </span>
            ),
          },
        ];
      case "academic":
        return [
          {
            header: "Student",
            accessor: "Student",
            render: (row) =>
              row.Student
                ? getFullName(row.Student.first_name, row.Student.last_name)
                : "-",
          },
          {
            header: "Exam",
            accessor: "Exam",
            render: (row) => row.Exam?.name || "-",
          },
          {
            header: "Subject",
            accessor: "Subject",
            render: (row) => row.Subject?.name || "-",
          },
          {
            header: "Marks",
            accessor: "marks_obtained",
            render: (row) => `${row.marks_obtained} / ${row.total_marks}`,
          },
          {
            header: "Grade",
            accessor: "grade",
            render: (row) => (
              <span className="font-bold">{row.grade || "-"}</span>
            ),
          },
        ];
      default:
        return [];
    }
  };

  const summaryCards = summary ? (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      {Object.entries(summary).map(([key, value]) => (
        <div key={key} className="card p-4">
          <p className="text-sm text-gray-500 capitalize">
            {key.replace("_", " ")}
          </p>
          <p className="text-xl font-bold">
            {typeof value === "number" && activeReport === "fees"
              ? formatCurrency(value)
              : value}
          </p>
        </div>
      ))}
    </div>
  ) : null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 text-sm">
          Generate and view school reports
        </p>
      </div>

      {/* Report type selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {reportTypes.map((report) => (
          <button
            key={report.name}
            onClick={() => setActiveReport(report.name)}
            className={`card p-4 text-left transition-colors ${
              activeReport === report.name
                ? "ring-2 ring-primary-500"
                : "hover:shadow-md"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
                <report.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-sm">{report.label}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {report.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Class</label>
            <select
              className="input"
              value={filters.class_id}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, class_id: e.target.value }))
              }
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          {activeReport === "fees" && (
            <div>
              <label className="label">Search Student Name</label>
              <input
                type="search"
                className="input"
                placeholder="Type student name..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />
            </div>
          )}
          <div className="flex items-end">
            <button
              className="btn-primary w-full"
              onClick={handleGenerateReport}
            >
              <FileText className="w-4 h-4 mr-1" /> Generate Report
            </button>
          </div>
        </div>
      </div>

      {summaryCards}

      <div className="card overflow-hidden">
        <Table columns={getColumns()} data={filteredData} loading={loading} />
      </div>

      {showInvoice && selectedFee && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
          <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 print-invoice">
            <div className="mb-6 flex items-start justify-between border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  School Fee Invoice
                </h2>
                <p className="text-sm text-gray-500">
                  Invoice: {selectedFee.invoice_no}
                </p>
              </div>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-900 print:hidden"
                onClick={() => setShowInvoice(false)}
                aria-label="Close invoice"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Student</p>
                <p className="font-semibold">
                  {getFullName(
                    selectedFee.Student?.first_name,
                    selectedFee.Student?.last_name,
                  )}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Student ID</p>
                <p className="font-semibold">
                  {selectedFee.Student?.student_id || "-"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Fee Type</p>
                <p className="font-semibold capitalize">
                  {selectedFee.fee_type}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-semibold">
                  {formatDate(selectedFee.created_at)}
                </p>
              </div>
            </div>
            <div className="border-y py-4 text-sm">
              <div className="flex justify-between">
                <span>Amount</span>
                <span>{formatCurrency(selectedFee.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span>{formatCurrency(selectedFee.discount || 0)}</span>
              </div>
              <div className="mt-3 flex justify-between font-semibold">
                <span>Paid</span>
                <span>{formatCurrency(selectedFee.paid_amount || 0)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Balance Due</span>
                <span>
                  {formatCurrency(
                    parseFloat(selectedFee.amount) -
                      parseFloat(selectedFee.discount || 0) -
                      parseFloat(selectedFee.paid_amount || 0),
                  )}
                </span>
              </div>
            </div>
            <div className="mt-6 flex justify-end print:hidden">
              <button
                type="button"
                className="btn-primary"
                onClick={printInvoice}
              >
                <Printer className="mr-1 h-4 w-4" /> Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
