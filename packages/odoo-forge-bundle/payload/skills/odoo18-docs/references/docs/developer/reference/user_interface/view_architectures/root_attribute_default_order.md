---
title: "A comma-separated list of fields names that overrides the ordering defined on the model through"
source_url: "https://docs.odoo.sbggai.top/developer/reference/user_interface/view_architectures/root_attribute_default_order.html"
---

.. attribute:: default_order
   :noindex:

   A comma-separated list of fields names that overrides the ordering defined on the model through
   the :attr:`~odoo.models.BaseModel._order` attribute.

   To inverse the sorting order of a field, postfix it with `desc`, separated by a space.

   .. example::
      ```xml

         <list default_order="sequence,name desc">
             ...
         </list>

   :requirement: Optional
   :type: str
   :default: `''`
