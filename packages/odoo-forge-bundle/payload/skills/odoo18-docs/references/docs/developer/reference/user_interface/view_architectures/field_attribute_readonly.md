---
title: "Whether the field can be modified by the user (`False`) or is read-only (`True`), as a Python"
source_url: "https://docs.odoo.sbggai.top/developer/reference/user_interface/view_architectures/field_attribute_readonly.html"
---

.. attribute:: readonly
   :noindex:

   Whether the field can be modified by the user (`False`) or is read-only (`True`), as a Python
   expression that evaluates to a bool.

   .. example::
      ```xml

         <field name="fname_a" readonly="True"/>
         <field name="fname_b" readonly="name_a in [fname_b, parent.fname_d]"/>

   :requirement: Optional
   :type: :ref:`Python expression <reference/view_architectures/python_expression>`
   :default: `False`
