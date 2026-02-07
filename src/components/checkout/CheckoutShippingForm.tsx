interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
}

interface CheckoutShippingFormProps {
  shippingInfo: ShippingInfo;
  onChange: (field: string, value: string) => void;
}

const CheckoutShippingForm = ({ shippingInfo, onChange }: CheckoutShippingFormProps) => {
  return (
    <div className="card p-5 lg:p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Shipping Address</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">First Name</label>
          <input
            placeholder="John"
            value={shippingInfo.firstName}
            onChange={(e) => onChange("firstName", e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Last Name</label>
          <input
            placeholder="Doe"
            value={shippingInfo.lastName}
            onChange={(e) => onChange("lastName", e.target.value)}
            className="input-field"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
          <input
            type="email"
            placeholder="john@example.com"
            value={shippingInfo.email}
            onChange={(e) => onChange("email", e.target.value)}
            className="input-field"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-1.5">Phone Number</label>
          <input
            placeholder="+234 800 000 0000"
            value={shippingInfo.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            className="input-field"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-1.5">Address</label>
          <input
            placeholder="123 Main Street"
            value={shippingInfo.address}
            onChange={(e) => onChange("address", e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">City</label>
          <input
            placeholder="Lagos"
            value={shippingInfo.city}
            onChange={(e) => onChange("city", e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">State</label>
          <input
            placeholder="Lagos State"
            value={shippingInfo.state}
            onChange={(e) => onChange("state", e.target.value)}
            className="input-field"
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutShippingForm;
