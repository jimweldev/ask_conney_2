import { FaTable } from 'react-icons/fa6';

const TableRequired = () => {
  return (
    <div className="text-muted-foreground p-layout flex flex-col items-center justify-center">
      <div className="p-layout">
        <FaTable className="size-12" />
      </div>
      <p className="text-center text-sm">Table name is required</p>
    </div>
  );
};

export default TableRequired;
