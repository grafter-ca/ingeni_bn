import Inventory from "../../features/vendor/Inventory";

const InventoryPage = () => {
  return (
    <main className="p-4 md:p-8 lg:p-12 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* By abstracting the logic into <Inventory />, this page 
           stays simple, fulfilling the Single Responsibility Principle.
        */}
        <Inventory />
      </div>
    </main>
  );
};

export default InventoryPage;