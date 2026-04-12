---
title: "Whether the column is visible (`False`) or hidden (`True`), as a Python expression that evaluates"
source_url: "https://docs.odoo.sbggai.top/developer/reference/user_interface/view_architectures/generic_attribute_column_invisible.html"
---

.. attribute:: column_invisible
   :noindex:

   Whether the column is visible (`False`) or hidden (`True`), as a Python expression that evaluates
   to a bool.

   Unlike `invisible`, it affects the entire column, and is evaluated without the subtree values.

   .. example::
      ```xml

         <field name="product_is_late" column_invisible="parent.has_late_products == False"/>
         <button type="object" name="action_confirm" column_invisible="context.get('hide_confirm')"/>

   :requirement: Optional
   :type: :ref:`Python expression <reference/view_architectures/python_expression>`
   :default: `False`
