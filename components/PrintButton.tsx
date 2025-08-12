import React from "react";

const PrintButton = () => (
  <div className="flex gap-2">
    <button
      className="px-4 py-2 rounded bg-blue-100 text-blue-600 font-medium hover:bg-blue-200 border border-transparent"
      // Add onClick for download functionality if needed
    >
      Download
    </button>
    <button
      onClick={() => window.print()}
      className="px-4 py-2 rounded bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 border border-transparent"
    >
      Print
    </button>
  </div>
);

export default PrintButton; 